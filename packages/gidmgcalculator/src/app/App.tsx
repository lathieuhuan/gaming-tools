import { ImporterProvider } from "@/lib/setup-importer";

import { TourOperator } from "@/lib/tour-operator";
import { Greeter } from "./Greeter";
import { Main } from "./Main";
import { Modals } from "./Modals";
import { Navbar } from "./Navbar";
import { Tracker } from "./Tracker";

import { DynamicStoreProvider } from "@/lib/dynamic-store";
import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export function App() {
  return (
    <ImporterProvider>
      <div className="App h-screen pt-8 text-light-1 bg-light-1">
        <DynamicStoreProvider>
          {({ store, persistor }) => (
            <StoreProvider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <Navbar />
                <Main />
                <Modals />
                <Tracker />
                <TourOperator />
              </PersistGate>
            </StoreProvider>
          )}
        </DynamicStoreProvider>
        <Greeter />
      </div>
    </ImporterProvider>
  );
}
