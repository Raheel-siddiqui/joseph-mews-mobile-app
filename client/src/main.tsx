import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load Umami only when both env vars are set — avoids broken
// %VITE_ANALYTICS_*% placeholders crashing local Express routing.
const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const analyticsWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
if (
  typeof analyticsEndpoint === "string" &&
  analyticsEndpoint.length > 0 &&
  typeof analyticsWebsiteId === "string" &&
  analyticsWebsiteId.length > 0
) {
  const script = document.createElement("script");
  script.defer = true;
  script.src = `${analyticsEndpoint.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = analyticsWebsiteId;
  document.body.appendChild(script);
}

createRoot(document.getElementById("root")!).render(<App />);
