import type { EffectToParseText } from "../models/EffectValueCalcs";
import type { Member } from "../models/Member";
import type { Team } from "../models/Team";

import { BonusCalc } from "../models/EffectValueCalcs";

export function memberShow(member: Member, team: Team) {
  //
  function buffText(spec: EffectToParseText, inputs?: number[]) {
    return new BonusCalc(member, team, { inputs }).parseAbilityText(spec);
  }

  return {
    buffText,
  };
}
