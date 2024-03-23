import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@lib/index.css";
import "./index.css";
import { ScreenSizeWatcher } from "@lib/main.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ScreenSizeWatcher>
    <App />
  </ScreenSizeWatcher>
);
