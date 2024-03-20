import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ConfigProvider, ScreenSizeWatcher } from "rond";

import App from "./App.tsx";
import { WikiImage } from "./components/index.ts";
import { DynamicStoreProvider } from "./features";
import "./assets/css/tailwind.css";
import "./assets/css/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <DynamicStoreProvider>
    {({ store, persistor }) => (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ScreenSizeWatcher>
            <ConfigProvider config={{ ImageFallback: WikiImage.Fallback }}>
              <App />
            </ConfigProvider>
          </ScreenSizeWatcher>
        </PersistGate>
      </Provider>
    )}
  </DynamicStoreProvider>
);
