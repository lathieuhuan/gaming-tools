import { ImporterProvider } from "@/systems/setup-importer";
import { Greeter } from "./Greeter";
import { Main } from "./Main";
import { Modals } from "./Modals";
import { Navbar } from "./Navbar";
import { Tracker } from "./Tracker";

export function App() {
  return (
    <ImporterProvider>
      <div className="App h-screen pt-8 text-light-default bg-light-default">
        <Navbar />
        <Main />

        <Greeter />
        <Modals />
        <Tracker />
      </div>
    </ImporterProvider>
  );
}
