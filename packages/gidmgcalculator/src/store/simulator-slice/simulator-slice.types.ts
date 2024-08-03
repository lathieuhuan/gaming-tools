import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  HitEvent,
  ModifyEvent,
  Simulation,
  SimulationChunk,
  SimulationManageInfo,
  SimulationMember,
  SimulationTarget,
} from "@Src/types";

export type SimulatorStage = "WAITING" | "PREPARING" | "RUNNING";

export type PendingSimulation = {
  name: string;
  members: (SimulationMember | null)[];
};

export type SimulatorState = {
  stage: SimulatorStage;
  pendingSimulation: PendingSimulation;
  activeId: number;
  activeMember: number;
  simulationManageInfos: SimulationManageInfo[];
  simulationsById: Record<string, Simulation>;
};

export type CreateSimulationPayload = PayloadAction<{
  name: string;
  members: SimulationMember[];
  chunks?: SimulationChunk[];
  target?: SimulationTarget;
}>;

export type AddEventPayload = PayloadAction<
  (Omit<ModifyEvent, "id"> | Omit<HitEvent, "id">) & {
    /** The character performing this event also switch to on field => create new chunk */
    alsoSwitch?: boolean;
  }
>;
