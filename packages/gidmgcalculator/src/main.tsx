import ReactDOM from "react-dom/client";
import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider, ScreenSizeWatcher } from "rond";

import { route } from "./app/route";
import { GenshinImage } from "./components";
import { DynamicStoreProvider, OptimizeDeptProvider } from "./features";
import { RouterProvider } from "./systems/router";

import "./assets/css/index.css";
import "./assets/css/tailwind.css";
import { QueryClientProvider } from "./systems/react-query";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ScreenSizeWatcher>
    <ConfigProvider config={{ ImageFallback: GenshinImage.Fallback }}>
      <QueryClientProvider>
        <DynamicStoreProvider>
          {({ store, persistor }) => (
            <StoreProvider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <OptimizeDeptProvider>
                  <RouterProvider route={route} />
                </OptimizeDeptProvider>
              </PersistGate>
            </StoreProvider>
          )}
        </DynamicStoreProvider>
      </QueryClientProvider>
    </ConfigProvider>
  </ScreenSizeWatcher>
);
