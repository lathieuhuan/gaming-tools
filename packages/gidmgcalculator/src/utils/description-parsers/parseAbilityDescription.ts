import { round } from "rond";
import {
  AbstractInitialBonusGetter,
  CalcTeamData,
  CharacterBuff,
  CharacterDebuff,
  InitialBonusGetter,
  TeammateInitialBonusGetter,
} from "@Calculation";

import Array_ from "../array-utils";
import { toMult } from "../pure-utils";
import { wrapText } from "./utils";

export const parseAbilityDescription = (
  ability: Pick<CharacterBuff | CharacterDebuff, "description" | "effects">,
  inputs: number[],
  bonusGetter: AbstractInitialBonusGetter
) => {
  return ability.description.replace(/\{[\w \-/,%^"'*@:=.[\]]+\}#\[\w*\]/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type.slice(1, -1);

    if (body[0] === "@") {
      const effect = Array_.toArray(ability.effects)[+body[1]];

      if (effect) {
        const { value, preExtra, max } = effect;
        let result =
          bonusGetter.getInitialBonusValue(value, { inputs }) * bonusGetter.getLevelScale(effect.lvScale, inputs);

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

export const parseSelfAbilityDescription = (
  ability: Pick<CharacterBuff | CharacterDebuff, "description" | "effects">,
  inputs: number[],
  teamData: CalcTeamData
) => {
  const bonusGetter = new InitialBonusGetter(true, teamData);
  return parseAbilityDescription(ability, inputs, bonusGetter);
};

export const parseTeammateAbilityDescription = (
  ability: Pick<CharacterBuff | CharacterDebuff, "description" | "effects">,
  inputs: number[]
) => {
  const bonusGetter = new TeammateInitialBonusGetter();
  return parseAbilityDescription(ability, inputs, bonusGetter);
};
