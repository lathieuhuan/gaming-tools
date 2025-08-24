import { AppGreeter, AppMain, AppModals, NavBar, SetupImportCenter, Tracker } from "@Src/sections";
import { BrowserRouter } from "@Src/features";

function App() {
  return (
    <BrowserRouter>
      <div className="App h-screen pt-8 text-light-default bg-light-default">
        <AppGreeter />
        <AppModals />
        <NavBar />
        <AppMain />
        <Tracker />
        <SetupImportCenter />
      </div>
    </BrowserRouter>
  );
}

export default App;
