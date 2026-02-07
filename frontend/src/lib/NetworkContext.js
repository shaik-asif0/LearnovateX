import React from "react";

const NetworkContext = React.createContext({
  isOnline: true, // Default to online mode
});

export default NetworkContext;
