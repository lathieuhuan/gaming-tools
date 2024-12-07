import { useScreenWatcher } from "rond";
import { AppMain, AppGreetingManager, AppModals, NavBar, SetupImportCenter, Tracker } from "@Src/features";

function App() {
  const screenWatcher = useScreenWatcher();

  return (
    <div className="App h-screen pt-8 text-light-default bg-light-default">
      <AppGreetingManager />
      <AppModals />
      <NavBar />
      {screenWatcher.isFromSize("sm") ? <AppMain.Large /> : <AppMain.Small />}
      <Tracker />
      <SetupImportCenter />
    </div>
  );
}

export default App;
