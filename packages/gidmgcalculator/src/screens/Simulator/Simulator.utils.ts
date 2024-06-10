import type { SimulationMember } from "@Src/types";
import type { RootState } from "@Store/store";

export const getActiveMember = (state: RootState): SimulationMember | undefined => {
  const { activeId, activeMember, simulationsById } = state.simulator;
  return simulationsById[activeId]?.members?.find((member) => member.name === activeMember);
};
