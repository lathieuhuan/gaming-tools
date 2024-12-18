import type { PartiallyRequired } from "rond";
import type { HitEvent, ModifyEvent, SimulationChunk, SystemEvent, BaseEvent } from "@Src/types";
import type { AttackReaction } from "@Backend";
import type { ActualAttackElement } from "@Src/backend/types";

type EntityPerformer = {
  type: "CHARACTER" | "WEAPON" | "ARTIFACT";
  title: string;
  icon: string;
};

type SystemPerformer = {
  type: "SYSTEM";
};

export type Performer = SystemPerformer | EntityPerformer;

type ProcessedBaseEvent = {
  performers: Performer[];
  description: string;
  error?: string;
};

type TransformEntityEvent<T extends BaseEvent> = Omit<PartiallyRequired<T, "duration">, "modifier">;

export type ProcessedSystemModifyEvent = PartiallyRequired<SystemEvent, "duration"> & ProcessedBaseEvent;

export type ProcessedEntityModifyEvent = TransformEntityEvent<ModifyEvent> & ProcessedBaseEvent;

export type ProcessedHitEvent = TransformEntityEvent<HitEvent> &
  ProcessedBaseEvent & {
    damage: {
      value: number;
      element: ActualAttackElement;
    };
    reaction: AttackReaction;
  };

export type SimulationProcessedEvent = ProcessedSystemModifyEvent | ProcessedEntityModifyEvent | ProcessedHitEvent;

export type SimulationProcessedChunk = Pick<SimulationChunk, "id" | "ownerCode"> & {
  events: SimulationProcessedEvent[];
};

export type SimulationSumary = {
  damage: number;
  /** in centisecond */
  duration: number;
};
