import React, { useState } from "react";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Youtube,
  Instagram,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../i18n/I18nProvider";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, setLanguage, language } = useI18n();

  const socials = [
    {
      icon: <Github className="w-5 h-5" />,
      label: t("footer.social.github", "GitHub"),
      href: "https://github.com/",
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      label: t("footer.social.twitter", "Twitter"),
      href: "https://twitter.com/",
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      label: t("footer.social.linkedin", "LinkedIn"),
      href: "https://www.linkedin.com/",
    },
    {
      icon: <Youtube className="w-5 h-5" />,
      label: t("footer.social.youtube", "YouTube"),
      href: "https://www.youtube.com/",
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      label: t("footer.social.instagram", "Instagram"),
      href: "https://www.instagram.com/",
    },
  ];

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(
        t("footer.subscribe.invalidEmail", "Please enter a valid email")
      );
      return;
    }
    setLoading(true);
    try {
      // Placeholder for real subscription API call
      await new Promise((res) => setTimeout(res, 700));
      setEmail("");
      toast.success(
        t("footer.subscribe.success", "Subscribed! Check your inbox")
      );
    } catch (err) {
      toast.error(t("footer.subscribe.failed", "Subscription failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-zinc-900 border-t border-zinc-800 text-zinc-300 py-8 sm:py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <h4 className="text-white text-xl font-semibold">
            {t("footer.brand", "LearnovateX")}
          </h4>
          <p className="text-sm text-zinc-400 mt-2 max-w-md">
            {t(
              "footer.description",
              "Built for learners — tools, roadmaps and AI to help you grow. Join our community and stay updated."
            )}
          </p>
          <div className="flex flex-wrap mt-4 gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
                aria-label={s.label}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
            <a
              href="mailto:hello@learnovatex.example"
              className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
              title="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h5 className="text-white font-medium mb-3">
            {t("footer.quickLinks.title", "Quick Links")}
          </h5>
          <ul className="text-zinc-400 space-y-2">
            <li>
              <a href="/dashboard" className="hover:text-white">
                {t("nav.dashboard", "Dashboard")}
              </a>
            </li>
            <li>
              <a href="/roadmap" className="hover:text-white">
                {t("nav.roadmap", "Roadmaps")}
              </a>
            </li>
            <li>
              <a href="/learning-path" className="hover:text-white">
                {t("nav.learningPath", "Learning Paths")}
              </a>
            </li>
            <li>
              <a href="/coding" className="hover:text-white">
                {t("nav.codingArena", "Coding Arena")}
              </a>
            </li>
            <li>
              <a href="/resume" className="hover:text-white">
                {t("nav.resumeAnalyzer", "Resume Analyzer")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-medium mb-3">
            {t("footer.recent.title", "Recent")}
          </h5>
          <ul className="text-zinc-400 space-y-2 text-sm">
            <li>
              <a href="/blog/how-to-start" className="hover:text-white">
                {t("footer.recent.buildRoadmap", "How to build a roadmap")}
              </a>
            </li>
            <li>
              <a href="/blog/ai-for-learners" className="hover:text-white">
                {t("footer.recent.aiTools", "AI tools for learners")}
              </a>
            </li>
            <li>
              <a href="/blog/resume-tips" className="hover:text-white">
                {t("footer.recent.resumeTips", "Resume tips for students")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-medium mb-3">
            {t("footer.newsletter.title", "Get updates")}
          </h5>
          <form
            onSubmit={subscribe}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("footer.newsletter.placeholder", "Your email")}
              className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded-md border border-zinc-700 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-md font-medium disabled:opacity-60 w-full sm:w-auto"
            >
              {loading ? "..." : t("footer.newsletter.subscribe", "Subscribe")}
            </button>
          </form>
          <div className="mt-4 text-zinc-400 text-sm">
            <div className="mb-2">{t("footer.contact.title", "Contact")}</div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4" />
              <a
                href={`mailto:${t(
                  "footer.email",
                  "support@learnovatex.example"
                )}`}
                className="hover:text-white"
              >
                {t("footer.email", "support@learnovatex.example")}
              </a>
            </div>
            <div className="mt-3">
              <label className="text-zinc-400 text-sm block mb-2 sm:mb-0 sm:inline sm:mr-2">
                {t("settings.language", "Language")}
              </label>
              <select
                className="bg-zinc-800 text-white px-2 py-1 rounded-md w-full sm:w-auto"
                onChange={(e) => setLanguage(e.target.value)}
                value={language}
              >
                <option value="en">{t("lang.en", "English")}</option>
                <option value="te">{t("lang.te", "తెలుగు")}</option>
                <option value="hi">{t("lang.hi", "हिन्दी")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 text-xs text-zinc-600">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span>
            © {new Date().getFullYear()} {t("footer.brand", "LearnovateX")}.{" "}
            {t("footer.copyright", "All rights reserved.")}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="/terms" className="hover:underline">
              {t("footer.links.terms", "Terms")}
            </a>
            <a href="/privacy" className="hover:underline">
              {t("footer.links.privacy", "Privacy")}
            </a>
            <a href="/contact" className="hover:underline">
              {t("footer.links.contact", "Contact")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
