import { enableMapSet } from "immer";
import ReactDOM from "react-dom/client";
// import { Provider as StoreProvider } from "react-redux";
// import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider, ScreenSizeWatcher } from "rond";

import { route } from "./app/route";
import { GenshinImage } from "./components";
// import { DynamicStoreProvider } from "./lib/dynamic-store";
import { QueryClientProvider } from "./lib/react-query";
import { RouterProvider } from "./lib/router";

import "@rc-component/dropdown/assets/index.css";
import "./style.css";

enableMapSet();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ScreenSizeWatcher>
    <ConfigProvider config={{ ImageFallback: GenshinImage.Fallback }}>
      <QueryClientProvider>
        {/* TODO: 
          - Undo after 1/6/2026
          - Also check App.tsx
        */}
        <RouterProvider route={route} />
        {/* 
          <DynamicStoreProvider>
            {({ store, persistor }) => (
              <StoreProvider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                  <RouterProvider route={route} />
                </PersistGate>
              </StoreProvider>
            )}
          </DynamicStoreProvider>
        */}
      </QueryClientProvider>
    </ConfigProvider>
  </ScreenSizeWatcher>
);
