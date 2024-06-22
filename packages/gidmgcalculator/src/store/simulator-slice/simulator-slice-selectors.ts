import type { RootState } from "../store";
import { getSimulation } from "./simulator-slice.utils";

export const selectActiveMember = (state: RootState) => state.simulator.activeMember;

export function selectOnFieldMember(state: RootState) {
  const chunks = getSimulation(state.simulator)?.chunks ?? [];
  return chunks[chunks.length - 1]?.ownerCode;
}
