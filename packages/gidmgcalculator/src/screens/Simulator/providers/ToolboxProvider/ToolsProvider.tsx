import { AppCharacter } from "@Backend";

import { SimulationMember, SimulationTarget } from "@Src/types";
import { useSelector } from "@Store/hooks";
import { getSimulation } from "@Store/simulator-slice";
import { RootState } from "@Store/store";
import { ToolsContext } from "./contexts";
import { SimulationControl } from "./tools";

const selectEvents = (state: RootState) => getSimulation(state.simulator)?.events ?? [];

export type AppParty = Record<string, AppCharacter>;

interface ToolboxProps {
  party?: SimulationMember[];
  target?: SimulationTarget;
  children: React.ReactNode;
}
export function ToolsProvider({ party, target, children }: ToolboxProps) {
  const events = useSelector(selectEvents);

  console.log("render: Toolbox");

  if (party && target) {
    const simulationCtrl = new SimulationControl(party, target);

    for (const event of events) {
      switch (event.type) {
        case "MODIFY":
          simulationCtrl.modify(event);
          break;
        case "HIT":
          simulationCtrl.hit(event);
          break;
      }
    }
  }

  return <ToolsContext.Provider value={null}>{children}</ToolsContext.Provider>;
}
