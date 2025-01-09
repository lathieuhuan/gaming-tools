import ReactDOM from "react-dom/client";
import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider, ScreenSizeWatcher } from "rond";

import App from "./App.tsx";
import { GenshinImage } from "./components";
import { DynamicStoreProvider, OptimizeSystemProvider } from "./features";
import "./assets/css/tailwind.css";
import "./assets/css/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ScreenSizeWatcher>
    <ConfigProvider config={{ ImageFallback: GenshinImage.Fallback }}>
      <DynamicStoreProvider>
        {({ store, persistor }) => (
          <StoreProvider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <OptimizeSystemProvider>
                <App />
              </OptimizeSystemProvider>
            </PersistGate>
          </StoreProvider>
        )}
      </DynamicStoreProvider>
    </ConfigProvider>
  </ScreenSizeWatcher>
);
