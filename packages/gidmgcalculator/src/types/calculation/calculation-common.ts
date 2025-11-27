import type TypeCounter from "@/utils/TypeCounter";
import type {
  AmplifyingReaction,
  AttributeStat,
  BaseAttributeStat,
  ElementType,
  QuickenReaction,
} from "../common";
import type { ITeam } from "../entity";

export type AttackReaction = AmplifyingReaction | QuickenReaction | null;

export type ElementCount = TypeCounter<ElementType>;

export type TotalAttributes = TypeCounter<AttributeStat | BaseAttributeStat>;

export type ICalcTeam = ITeam;
