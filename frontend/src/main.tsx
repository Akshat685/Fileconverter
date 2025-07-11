import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Load Dropbox SDK dynamically using .env key
const loadDropboxScript = () => {
  const existingScript = document.getElementById("dropboxjs");
  if (existingScript) return;

  const script = document.createElement("script");
  script.src = "https://www.dropbox.com/static/api/2/dropins.js";
  script.id = "dropboxjs";
  script.type = "text/javascript";
  script.setAttribute(
    "data-app-key",
    import.meta.env.VITE_DROPBOX_APP_KEY || ""
  );
  document.body.appendChild(script);
};

const Root = () => {
  useEffect(() => {
    loadDropboxScript();
  }, []);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
