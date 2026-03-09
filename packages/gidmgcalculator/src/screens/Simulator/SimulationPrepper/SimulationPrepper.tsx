import { TeamAssembler } from "./TeamAssembler";
import { TopBar } from "./TopBar";

export function SimulationPrepper() {
  return (
    <div className="h-full flex flex-col">
      <TopBar />
      <TeamAssembler className="grow" />
    </div>
  );
}
