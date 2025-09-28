import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ScreenSizeWatcher } from "@lib/main.ts";

import "@lib/styles/index.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ScreenSizeWatcher>
    <App />
  </ScreenSizeWatcher>
);
