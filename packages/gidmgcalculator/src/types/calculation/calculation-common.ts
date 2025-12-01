import type { AmplifyingReaction, QuickenReaction } from "../common";
import type { ITeam } from "../entity";

export type AttackReaction = AmplifyingReaction | QuickenReaction | null;

export type ICalcTeam = ITeam;
