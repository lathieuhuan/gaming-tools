import type { EffectApplicableCondition } from "@Src/calculation/types";
import { Character } from "@Src/types";
import { CharacterCalc } from "../calc-utils";

export function isAvailableTeammateEffect(condition: EffectApplicableCondition, inputs: number[]): boolean {
  return condition.altIndex === undefined || !!inputs[condition.altIndex];
}

export function isAvailableSelfEffect(condition: EffectApplicableCondition, character: Character): boolean {
  return CharacterCalc.isGrantedEffect(condition.grantedAt, character);
}

export function isAvailableEffect(
  condition: EffectApplicableCondition,
  character: Character,
  inputs: number[],
  fromSelf: boolean
): boolean {
  return fromSelf ? isAvailableSelfEffect(condition, character) : isAvailableTeammateEffect(condition, inputs);
}
