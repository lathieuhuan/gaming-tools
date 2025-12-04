import { round } from "rond";
import {
  CalcTeamData,
  CharacterBuff,
  CharacterDebuff,
  InitialBonusGetter,
} from "@Calculation";

import Array_ from "../Array";
import { toMult } from "../pure-utils";
import { wrapText } from "./utils";

export const parseAbilityDesc = (
  ability: Pick<CharacterBuff | CharacterDebuff, "description" | "effects">,
  support: {
    inputs: number[];
    fromSelf: boolean;
  },
  bonusGetter: InitialBonusGetter
) => {
  return ability.description.replace(/\{.+?\}#\[\w*\]/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type.slice(1, -1);

    if (body[0] === "@") {
      const effect = Array_.toArray(ability.effects)[+body[1]];

      if (effect) {
        const { value, preExtra, max } = effect;
        let result = bonusGetter.getInitialValue(value, support) * bonusGetter.getLevelScale(effect.lvScale, support);

        if (typeof preExtra === "number") result += preExtra;
        if (typeof max === "number" && result > max) result = max;

        const decimal = +body[3];
        if (!isNaN(decimal)) {
          if (body[2] === "'") result *= 100;
          result = round(result, decimal);
        }

        switch (body[body.length - 1]) {
          case "%":
            body = result + "%";
            break;
          case "*":
            body = `${round(toMult(result), 3)}`;
            break;
          default:
            body = `${result}`;
        }
      }
    }
    if (body[0] === "@") body = "?";

    return wrapText(body, type);
  });
};

export const parseSelfAbilityDesc = (
  ability: Pick<CharacterBuff | CharacterDebuff, "description" | "effects">,
  inputs: number[],
  teamData: CalcTeamData
) => {
  const bonusGetter = new InitialBonusGetter(teamData);
  return parseAbilityDesc(ability, { inputs, fromSelf: true }, bonusGetter);
};

export const parseTeammateAbilityDesc = (
  ability: Pick<CharacterBuff | CharacterDebuff, "description" | "effects">,
  inputs: number[],
  teamData: CalcTeamData
) => {
  const bonusGetter = new InitialBonusGetter(teamData);
  return parseAbilityDesc(ability, { inputs, fromSelf: false }, bonusGetter);
};
