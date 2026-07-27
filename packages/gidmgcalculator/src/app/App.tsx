import { ImporterProvider } from "@/lib/setup-importer";
import { Greeter } from "./Greeter";
import { Main } from "./Main";
import { Modals } from "./Modals";
import { Navbar } from "./Navbar";
import { TourOperator } from "./TourOperator";
import { Tracker } from "./Tracker";

export function App() {
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
