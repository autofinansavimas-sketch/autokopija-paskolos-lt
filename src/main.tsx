import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installCacheGuard } from "./swCacheGuard";

installCacheGuard();

createRoot(document.getElementById("root")!).render(<App />);
