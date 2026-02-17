import { ImporterProvider } from "@/systems/setup-importer";

import { TourOperator } from "@/systems/tour";
import { Greeter } from "./Greeter";
import { Main } from "./Main";
import { Modals } from "./Modals";
import { Navbar } from "./Navbar";
import { Tracker } from "./Tracker";

import { DynamicStoreProvider } from "@/systems/dynamic-store";
import { selectAppReady, useUIStore } from "@Store/ui";
import { Provider as StoreProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LoadingPlate } from "rond";

export function App() {
  return (
    <ImporterProvider>
      <div className="App h-screen pt-8 text-light-1 bg-light-1">
        {/* TODO
          - Undo after 1/6/2026
          - Also check main.tsx
        */}
        <RehydrateSuspend />
        {/* 
          <Navbar />
          <Main />
          <Modals />
          <Tracker />
        */}
        <Greeter />
      </div>
    </ImporterProvider>
  );
}

// TODO: Remove after the above undo
function RehydrateSuspend() {
  const appReady = useUIStore(selectAppReady);

  if (!appReady) {
    return (
      <div className="bg-dark-2 absolute inset-0 flex-center">
        <LoadingPlate />
      </div>
    );
  }

  return (
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
  );
}
