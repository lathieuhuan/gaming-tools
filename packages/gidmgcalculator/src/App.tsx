import { AppGreeter, AppMain, AppModals, NavBar, SetupImportCenter, Tracker } from "@Src/features";

function App() {
  return (
    <div className="App h-screen pt-8 text-light-default bg-light-default">
      <AppGreeter />
      <AppModals />
      <NavBar />
      <AppMain />
      <Tracker />
      <SetupImportCenter />
    </div>
  );
}

export default App;
