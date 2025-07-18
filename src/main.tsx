import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/sentry"; // Initialize Sentry

createRoot(document.getElementById("root")!).render(<App />);
