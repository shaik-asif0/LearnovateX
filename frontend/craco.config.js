// craco.config.js
const path = require("path");
require("dotenv").config();
const { GenerateSW } = require("workbox-webpack-plugin");

// Check if we're in development/preview mode (not production build)
// Craco sets NODE_ENV=development for start, NODE_ENV=production for build
const isDevServer = process.env.NODE_ENV !== "production";

// Environment variable overrides
const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
  enableVisualEdits: false, // Disabled due to recursion bug in babel plugin
};

// Conditionally load visual edits modules only in dev mode
let setupDevServer;
let babelMetadataPlugin;

if (config.enableVisualEdits) {
  setupDevServer = require("./plugins/visual-edits/dev-server-setup");
  babelMetadataPlugin = require("./plugins/visual-edits/babel-metadata-plugin");
}

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

const webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      // Add ignored patterns to reduce watched directories
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/build/**",
          "**/dist/**",
          "**/coverage/**",
          "**/public/**",
        ],
      };

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }

      // Add Workbox for offline support only in production builds.
      // Avoid generating service worker during dev server (watch mode), which
      // can cause duplicate-GenerateSW warnings and an inaccurate precache.
      if (process.env.NODE_ENV === "production") {
        webpackConfig.plugins.push(
          new GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            // Allow larger bundles to be precached if needed (default is small).
            maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB
            runtimeCaching: [
              {
                urlPattern: ({ url }) =>
                  url.origin === "http://localhost:5000" ||
                  url.origin === process.env.REACT_APP_BACKEND_URL,
                handler: "NetworkFirst",
                options: {
                  cacheName: "api-cache",
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 24 * 60 * 60,
                  },
                },
              },
              {
                urlPattern: ({ request }) => request.destination === "image",
                handler: "CacheFirst",
                options: {
                  cacheName: "images",
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 7 * 24 * 60 * 60,
                  },
                },
              },
            ],
          })
        );
      }

      return webpackConfig;
    },
  },
};

// Only add babel metadata plugin during dev server
if (config.enableVisualEdits && babelMetadataPlugin) {
  webpackConfig.babel = {
    plugins: [babelMetadataPlugin],
  };
}

webpackConfig.devServer = (devServerConfig) => {
  // Apply visual edits dev server setup only if enabled
  if (config.enableVisualEdits && setupDevServer) {
    devServerConfig = setupDevServer(devServerConfig);
  }

  // Add health check endpoints if enabled
  if (
    config.enableHealthCheck &&
    setupHealthEndpoints &&
    healthPluginInstance
  ) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Call original setup if exists
      if (originalSetupMiddlewares) {
        middlewares = originalSetupMiddlewares(middlewares, devServer);
      }

      // Setup health endpoints
      setupHealthEndpoints(devServer, healthPluginInstance);

      return middlewares;
    };
  }

  return devServerConfig;
};

module.exports = webpackConfig;
