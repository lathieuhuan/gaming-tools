import type { CharacterBuff, CharacterDebuff } from "@/types";
import type { AbstractEffectValueCalc } from "../AbstractEffectValueCalc";

import Array_ from "@/utils/Array";
import { wrapText } from "@/utils/description-parsers/utils";
import { round, toMult } from "@/utils/pure-utils";

type AbilityBuff = CharacterBuff | CharacterDebuff;

export const parseAbilityDesc = (
  description: AbilityBuff["description"],
  effects: AbilityBuff["effects"],
  valueCalc: AbstractEffectValueCalc
) => {
  return description.replace(/\{.+?\}#\[\w*\]/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type.slice(1, -1);

    if (body[0] === "@") {
      const effect = Array_.toArray(effects)[+body[1]];

      if (effect) {
        const { preExtra, max } = effect;
        let result = valueCalc.getInitialValue(effect);

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
