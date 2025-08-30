import ReactDOM from "react-dom/client";
import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider, ScreenSizeWatcher } from "rond";

import { route } from "./app/route";
import { GenshinImage } from "./components";
import { DynamicStoreProvider } from "./systems/dynamic-store";
import { OptimizeDeptProvider } from "./systems/optimize-dept";
import { QueryClientProvider } from "./systems/react-query";
import { RouterProvider } from "./systems/router";
import { ImporterProvider } from "./systems/setup-importer";

import "./assets/css/index.css";
import "./assets/css/tailwind.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ScreenSizeWatcher>
    <ConfigProvider config={{ ImageFallback: GenshinImage.Fallback }}>
      <QueryClientProvider>
        <DynamicStoreProvider>
          {({ store, persistor }) => (
            <StoreProvider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <ImporterProvider>
                  <OptimizeDeptProvider>
                    <RouterProvider route={route} />
                  </OptimizeDeptProvider>
                </ImporterProvider>
              </PersistGate>
            </StoreProvider>
          )}
        </DynamicStoreProvider>
      </QueryClientProvider>
    </ConfigProvider>
  </ScreenSizeWatcher>
);
