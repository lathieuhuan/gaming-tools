import type {
  AttackElementBonus,
  AttackElementPath,
  AttackPatternBonus,
  AttackPatternPath,
  ReactionBonus,
  ReactionBonusPath,
  ResistanceReduction,
  ResistanceReductionKey,
  TotalAttribute,
  TotalAttributeStat,
  Tracker,
} from "@Src/types";
import { toArray } from "@Src/utils";

type ModRecipient = TotalAttribute | ReactionBonus | AttackPatternBonus | AttackElementBonus | ResistanceReduction;

type ModRecipientKey =
  | TotalAttributeStat
  | TotalAttributeStat[]
  | ReactionBonusPath
  | ReactionBonusPath[]
  | AttackPatternPath
  | AttackPatternPath[]
  | AttackElementPath
  | AttackElementPath[]
  | ResistanceReductionKey
  | ResistanceReductionKey[];

type RootValue = number | number[];

export function applyModifier(
  desc: string | undefined,
  recipient: TotalAttribute,
  keys: TotalAttributeStat | TotalAttributeStat[],
  rootValue: RootValue,
  tracker?: Tracker
): void;
export function applyModifier(
  desc: string | undefined,
  recipient: AttackPatternBonus,
  keys: AttackPatternPath | AttackPatternPath[],
  rootValue: RootValue,
  tracker?: Tracker
): void;
export function applyModifier(
  desc: string | undefined,
  recipient: AttackElementBonus,
  keys: AttackElementPath | AttackElementPath[],
  rootValue: RootValue,
  tracker?: Tracker
): void;
export function applyModifier(
  desc: string | undefined,
  recipient: ReactionBonus,
  keys: ReactionBonusPath | ReactionBonusPath[],
  rootValue: RootValue,
  tracker?: Tracker
): void;
export function applyModifier(
  desc: string | undefined,
  recipient: ResistanceReduction,
  keys: ResistanceReductionKey | ResistanceReductionKey[],
  rootValue: RootValue,
  tracker?: Tracker
): void;

export function applyModifier(
  desc: string | undefined = "",
  recipient: ModRecipient,
  keys: ModRecipientKey,
  rootValue: RootValue,
  tracker?: Tracker
) {
  let trackerKey: keyof Tracker;

  if ("atk" in recipient) {
    trackerKey = "totalAttr";
  } else if ("all" in recipient) {
    trackerKey = "attPattBonus";
  } else if ("bloom" in recipient) {
    trackerKey = "rxnBonus";
  } else if ("def" in recipient) {
    trackerKey = "resistReduct";
  } else {
    trackerKey = "attElmtBonus";
  }

  toArray(keys).forEach((key, i) => {
    const [field, subField] = key.split(".");
    const value = Array.isArray(rootValue) ? rootValue[i] : rootValue;
    const node = {
      desc,
      value,
    };
    // recipient: TotalAttribute, ReactionBonus, ResistanceReduction
    if (subField === undefined) {
      (recipient as any)[field] += value;
      if (tracker) {
        (tracker as any)[trackerKey][field].push(node);
      }
    } else {
      (recipient as any)[field][subField] += value;
      if (tracker) {
        (tracker as any)[trackerKey][key].push(node);
      }
    }
  });
}
