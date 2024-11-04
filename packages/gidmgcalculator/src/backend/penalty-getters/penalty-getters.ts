import type { ArtifactPenaltyCore, CharacterPenaltyCore, EntityPenaltyCore } from "../types";
import { CalculationInfo, CharacterCalc, EntityCalc } from "../utils";

export type GetPenaltyArgs<T extends EntityPenaltyCore> = {
  config: T;
  info: CalculationInfo;
  inputs: number[];
  fromSelf: boolean;
};

export function getPenaltyFromCharacter(args: GetPenaltyArgs<CharacterPenaltyCore>) {
  const { config, info, inputs, fromSelf } = args;
  const { preExtra } = config;
  let result = config.value * CharacterCalc.getLevelScale(config.lvScale, info, inputs, fromSelf);

  if (typeof preExtra === "number") {
    result += preExtra;
  } else if (preExtra && EntityCalc.isApplicableEffect(preExtra, info, inputs, fromSelf)) {
    result += getPenaltyFromCharacter({ ...args, config: preExtra });
  }
  if (config.max && result > config.max) result = config.max;

  return Math.max(result, 0);
}

export function getPenaltyFromArtifact(args: GetPenaltyArgs<ArtifactPenaltyCore>) {
  return args.config.value;
}
