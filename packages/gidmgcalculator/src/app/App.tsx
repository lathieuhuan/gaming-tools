import { Outlet } from "@Src/systems/router";
import { Greeter } from "./Greeter";
// import { Main } from "./Main";
import { Modals } from "./Modals";
import { Navbar } from "./Navbar";
import { SetupImportCenter } from "./SetupImportCenter";
import { Tracker } from "./Tracker";

export function App() {
  return (
    <div className="App h-screen pt-8 text-light-default bg-light-default">
      <Greeter />
      <Modals />
      <Navbar />
      <Outlet />
      <Tracker />
      <SetupImportCenter />
    </div>
  );
}
