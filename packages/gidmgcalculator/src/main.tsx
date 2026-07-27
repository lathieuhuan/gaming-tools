import { enableMapSet } from "immer";
import ReactDOM from "react-dom/client";
import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ScreenSizeWatcher } from "rond";

import { route } from "./app/route";
import { DynamicStoreProvider } from "./lib/dynamic-store";
import { QueryClientProvider } from "./lib/react-query";
import { ConfigProvider } from "./lib/rond/ConfigProvider";
import { RouterProvider } from "./lib/router";

import "@rc-component/dropdown/assets/index.css";
import "./style.css";

enableMapSet();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ScreenSizeWatcher>
    <ConfigProvider>
      <QueryClientProvider>
        <DynamicStoreProvider>
          {({ store, persistor }) => (
            <StoreProvider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <RouterProvider route={route} />
              </PersistGate>
            </StoreProvider>
          )}
        </DynamicStoreProvider>
      </QueryClientProvider>
    </ConfigProvider>
  </ScreenSizeWatcher>,
);
