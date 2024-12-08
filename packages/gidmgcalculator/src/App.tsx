import { useScreenWatcher } from "rond";
import { AppMain, AppGreeter, AppModals, NavBar, SetupImportCenter, Tracker } from "@Src/features";

function App() {
  const screenWatcher = useScreenWatcher();

  return (
    <div className="App h-screen pt-8 text-light-default bg-light-default">
      <AppGreeter />
      <AppModals />
      <NavBar />
      {screenWatcher.isFromSize("sm") ? <AppMain.Large /> : <AppMain.Small />}
      <Tracker />
      <SetupImportCenter />
    </div>
  );
}

export default App;
