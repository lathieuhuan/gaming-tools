import type { AttackElement } from "@Backend";
import type { AttackReaction, HitEvent, EntityModifyEvent, SimulationChunk, SystemModifyEvent } from "@Src/types";
import { PartiallyRequired } from "rond";

type ProcessedBaseEvent = {
  description: string;
  error?: string;
};

export type ProcessedSystemModifyEvent = PartiallyRequired<SystemModifyEvent, "duration"> & ProcessedBaseEvent & {};

export type ProcessedEntityModifyEvent = PartiallyRequired<EntityModifyEvent, "duration"> & ProcessedBaseEvent & {};

export type ProcessedHitEvent = PartiallyRequired<HitEvent, "duration"> &
  ProcessedBaseEvent & {
    damage: {
      value: number;
      element: AttackElement;
    };
    reaction: AttackReaction;
  };

export type SimulationProcessedEvent = ProcessedSystemModifyEvent | ProcessedEntityModifyEvent | ProcessedHitEvent;

export type SimulationProcessedChunk = Pick<SimulationChunk, "id" | "ownerCode"> & {
  events: SimulationProcessedEvent[];
};

export type SimulationSumary = {
  damage: number;
  duration: number;
};
