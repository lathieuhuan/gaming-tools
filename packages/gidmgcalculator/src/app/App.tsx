import { Greeter } from "./Greeter";
import { Main } from "./Main";
import { Modals } from "./Modals";
import { Navbar } from "./Navbar";
import { Tracker } from "./Tracker";

export function App() {
  return (
    <div className="App h-screen pt-8 text-light-1 bg-light-1">
      <Navbar />
      <Main />

      <Greeter />
      <Modals />
      <Tracker />
    </div>
  );
}
