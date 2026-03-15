import { enableMapSet } from "immer";
import ReactDOM from "react-dom/client";
import { ConfigProvider, ScreenSizeWatcher } from "rond";

import { route } from "./app/route";
import { GenshinImage } from "./components";
import { QueryClientProvider } from "./lib/react-query";
import { RouterProvider } from "./lib/router";

import "@rc-component/dropdown/assets/index.css";
import "./style.css";

enableMapSet();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ScreenSizeWatcher>
    <ConfigProvider config={{ ImageFallback: GenshinImage.Fallback }}>
      <QueryClientProvider>
        <RouterProvider route={route} />
      </QueryClientProvider>
    </ConfigProvider>
  </ScreenSizeWatcher>
);
