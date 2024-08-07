import type { PayloadAction } from "@reduxjs/toolkit";
import type { HitEvent, ModifyEvent, Simulation, SimulationMember } from "@Src/types";

export type SimulatorStage = "WAITING" | "ASSEMBLING" | "RUNNING";

export type AssembledSimulation = Pick<Simulation, "id" | "name" | "timeOn"> &
  Partial<Pick<Simulation, "chunks" | "target">> & {
    members: (SimulationMember | null)[];
  };

export type SimulatorState = {
  stage: SimulatorStage;
  assembledSimulation: AssembledSimulation;
  activeId: number;
  activeMember: number;
  simulations: Simulation[];
};

export type UpdateSimulatorPayload = PayloadAction<
  Partial<Pick<SimulatorState, "stage" | "assembledSimulation" | "activeId" | "activeMember" | "simulations">>
>;

export type UpdateAssembledSimulationPayload = PayloadAction<Partial<Omit<AssembledSimulation, "id">>>;

type OmittedKeys = "id" | "duration";

export type AddEventPayload = PayloadAction<
  (Omit<ModifyEvent, OmittedKeys> | Omit<HitEvent, OmittedKeys>) & {
    /** The character performing this event also switch to on field => create new chunk */
    alsoSwitch?: boolean;
    duration?: number;
  }
>;
