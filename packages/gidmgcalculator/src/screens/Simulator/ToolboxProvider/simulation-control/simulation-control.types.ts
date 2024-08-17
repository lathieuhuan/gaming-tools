import type { AttackElement } from "@Backend";
import type { AttackReaction, HitEvent, ModifyEvent, SimulationChunk, SystemEvent, BaseEvent } from "@Src/types";
import { PartiallyRequired } from "rond";

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
  /** in centisecond */
  duration: number;
};
