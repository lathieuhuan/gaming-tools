import { useSettingsStore } from "@Store/settings";
import { updateUI } from "@Store/ui";
import { useLayoutEffect } from "react";

import { ImporterProvider } from "@/lib/setup-importer";
import { Greeter } from "./Greeter";
import { Main } from "./Main";
import { Modals } from "./Modals";
import { Navbar } from "./Navbar";
import { TourOperator } from "./TourOperator";
import { Tracker } from "./Tracker";

export function App() {
  useLayoutEffect(() => {
    updateUI({ appModalType: "INTRO" });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { askBeforeUnload } = useSettingsStore.getState();

      if (askBeforeUnload) {
        e.preventDefault();
        return (e.returnValue = "Are you sure you want to exit?");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload, { capture: true });
    };
  }, []);

  return (
    <ImporterProvider>
      <div className="App h-screen pt-8 text-light-1 bg-light-1">
        <Navbar />
        <Main />
        <Modals />
        <Tracker />
        <TourOperator />
        <Greeter />
      </div>
    </ImporterProvider>
  );
}
