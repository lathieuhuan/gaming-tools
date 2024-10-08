import { useEffect } from "react";
import { useScreenWatcher } from "rond";

import { AppMain, AppModals, NavBar, SetupImportCenter, Tracker } from "@Src/features";
import { $AppSettings } from "./services";

function App() {
  const screenWatcher = useScreenWatcher();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ($AppSettings.get("askBeforeUnload")) {
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
    <div className="App h-screen pt-8 text-light-default bg-light-default">
      <NavBar />
      {screenWatcher.isFromSize("sm") ? <AppMain.Large /> : <AppMain.Small />}
      <AppModals />
      <Tracker />
      <SetupImportCenter />
    </div>
  );
}

export default App;
