import { useEffect } from "react";
import { useScreenWatcher } from "rond";

import { AppMain, AppModals, NavBar, SetupImportCenter, SetupTransshipmentPort, Tracker } from "@Src/features";

function App() {
  const screenWatcher = useScreenWatcher();

  useEffect(() => {
    const beforeunloadAlert = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = "Are you sure you want to exit?");
    };
    window.addEventListener("beforeunload", beforeunloadAlert, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", beforeunloadAlert, { capture: true });
    };
  }, []);

  return (
    <div className="App h-screen pt-8 text-light-default bg-light-default">
      <NavBar />
      {screenWatcher.isFromSize("sm") ? <AppMain.Large /> : <AppMain.Small />}
      <AppModals />
      <Tracker />
      <SetupTransshipmentPort />
      <SetupImportCenter />
    </div>
  );
}

export default App;
