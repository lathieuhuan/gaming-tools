import { EffectToParseText } from "./AbstractEffectValueCalc";
import { BonusCalc } from "./BonusCalc";
import { Team } from "./Team";

export function memberShow(memberCode: number, team: Team) {
  const member = team.getMember(memberCode);

  function buffText(spec: EffectToParseText, inputs?: number[]) {
    return new BonusCalc(member, team, { inputs }).parseAbilityText(spec);
  }

  return {
    buffText,
  };
}
