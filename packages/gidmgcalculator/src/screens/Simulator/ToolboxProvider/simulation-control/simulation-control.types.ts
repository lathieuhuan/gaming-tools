import type { AttackElement } from "@Backend";
import type { AttackReaction, HitEvent, ModifyEvent, SimulationChunk } from "@Src/types";
import { PartiallyRequired } from "rond";

type ProcessedBaseEvent = {
  description: string;
  error?: string;
};

export type ProcessedModifyEvent = PartiallyRequired<ModifyEvent, "duration"> & ProcessedBaseEvent & {};

export type ProcessedHitEvent = PartiallyRequired<HitEvent, "duration"> &
  ProcessedBaseEvent & {
    damage: {
      value: number;
      element: AttackElement;
    };
    reaction: AttackReaction;
  };

export type SimulationProcessedEvent = ProcessedModifyEvent | ProcessedHitEvent;

export type SimulationProcessedChunk = Pick<SimulationChunk, "id" | "ownerCode"> & {
  events: SimulationProcessedEvent[];
};

export type SimulationSumary = {
  damage: number;
  duration: number;
};
