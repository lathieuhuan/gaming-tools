import type TypeCounter from "@/utils/TypeCounter";
import type { AppArtifact } from "./app-artifact";
import type { AppCharacter } from "./app-character";
import type {
  EffectPerformableCondition,
  TeamConditions,
  TeamElementConditions,
  TeamPropertyCondition,
} from "./app-entity";
import type { ElementCount, TotalAttributes } from "./calculation";
import type {
  ArtifactType,
  AttackElement,
  AttributeStat,
  ElementType,
  Level,
  TalentType,
  WeaponType,
} from "./common";

export type ICharacterBasic = {
  name: string;
  level: Level;
  NAs: number;
  ES: number;
  EB: number;
  cons: number;
  enhanced: boolean;
};

export type IWeaponBasic = {
  code: number;
  type: WeaponType;
  refi: number;
};

export type IWeapon = IWeaponBasic & {
  ID: number;
  level: Level;
};

export type ArtifactSubStat = {
  type: AttributeStat;
  value: number;
};

export type IArtifact = {
  ID: number;
  code: number;
  type: ArtifactType;
  rarity: number;
  level: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
};

export type IArtifactGearSet = {
  bonusLv: number;
  pieceCount: number;
  data: AppArtifact;
};

export type IArtifactGearPieces<T extends IArtifact = IArtifact> = Partial<
  Record<ArtifactType, T>
> &
  Iterable<T>;

export type IArtifactGear<T extends IArtifact = IArtifact> = {
  pieces: IArtifactGearPieces<T>;
  sets: IArtifactGearSet[];
  attributes: TotalAttributes;
};

export type ITeammateBasic = {
  name: string;
  enhanced?: boolean;
};

export type ITeamMember<TTeam extends ITeam = ITeam> = ITeammateBasic & {
  data: AppCharacter;
  join(team: TTeam): void;
  isPerformableEffect(condition?: EffectPerformableCondition, inputs?: number[]): boolean;
};

export type ITeam = {
  members: ITeamMember[];
  elmtCount: ElementCount;
  resonances: ElementType[];
  extraTalentLv: TypeCounter<TalentType>;
  moonsignLv: number;
  witchRiteLv: number;
  checkTeamElmt(condition: TeamElementConditions): boolean;
  checkTeamProps(condition: TeamPropertyCondition): boolean;
  isAvailableEffect(condition: TeamConditions): boolean;
  getMixedCount(performerElmt: ElementType): number;
};

export type ITarget = {
  code: number;
  level: number;
  variantType?: ElementType;
  inputs?: number[];
  resistances: Record<AttackElement, number>;
};
