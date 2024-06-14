import type { RootState } from "../store";

export const selectActiveMember = (state: RootState) => state.simulator.activeMember;
