import { round } from "rond";
import {
  CharacterCalc,
  CharacterBuff,
  CharacterDebuff,
  AppWeapon,
  WeaponBuff,
  BareBonusGetter,
  AppArtifact,
  ArtifactModifierDescription,
  CharacterRecord,
} from "@Backend";

import { toMult } from "./pure-utils";
import Array_ from "./array-utils";

const typeToCls: Record<string, string> = {
  k: "text-bonus-color", // key
  v: "text-bonus-color font-bold", // value
  m: "text-danger-max", // max
  n: "text-hint-color", // note
  ms: "text-primary-1", // milestone
  anemo: "text-anemo",
  cryo: "text-cryo",
  dendro: "text-dendro",
  electro: "text-electro",
  geo: "text-geo",
  hydro: "text-hydro",
  pyro: "text-pyro",
};

const wrapText = (text: string | number, type = "") => {
  return `<span class="${typeToCls[type] || ""}">${text}</span>`;
};

export const parseResonanceDescription = (description: string) => {
  return description.replace(/\{[\w %]+\}#\[[kvm]\]/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type.slice(1, -1);

    return wrapText(body, type);
  });
};

export const parseAbilityDescription = (
  ability: Pick<CharacterBuff | CharacterDebuff, "description" | "effects">,
  record: CharacterRecord,
  inputs: number[],
  fromSelf: boolean
) => {
  const bonusGetter = new BareBonusGetter(record);

  return ability.description.replace(/\{[\w \-/,%^"'*@:=.[\]]+\}#\[\w*\]/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type.slice(1, -1);

    if (body[0] === "@") {
      const effect = Array_.toArray(ability.effects)[+body[1]];

      if (effect) {
        const { value, preExtra, max } = effect;
        let result = bonusGetter.getIntialBonusValue(value, { inputs, fromSelf });

        result *= CharacterCalc.getLevelScale(effect.lvScale, record, inputs, fromSelf);
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

const scaleRefi = (base: number, refi: number, increment = base / 3) => round(base + increment * refi, 3);

export const parseWeaponDescription = (description: string, refi: number) => {
  return description.replace(/\{[\w \-,.%'"^$]+\}(#\[[kvm]\])?/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type?.slice(1, -1);
    let suffix = "";

    if (body[body.length - 1] === "%") {
      body = body.slice(0, -1);
      suffix = "%";
    }

    if (body.includes("^")) {
      const [base, increment] = body.split("^");
      return wrapText(scaleRefi(+base, refi, increment ? +increment : undefined) + suffix, type);
    }
    if (body.includes("$")) {
      const values = body.split("$");
      return wrapText(values[refi - 1] + suffix, type);
    }
    return wrapText(body + suffix, type);
  });
};

export const getWeaponBuffDescription = (descriptions: AppWeapon["descriptions"], buff: WeaponBuff, refi: number) => {
  if (descriptions?.length) {
    const parsedFrags: string[] = [];

    for (const frag of Array_.toArray(buff.description ?? 0)) {
      const description = typeof frag === "number" ? descriptions[frag] : frag;
      parsedFrags.push(parseWeaponDescription(description ?? "", refi));
    }
    return parsedFrags.join(" ");
  }
  return "";
};

export const parseArtifactDescription = (description: string) => {
  return description.replace(/\{[\w \-,%]+\}#\[[kvm]\]/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type?.slice(1, -1);
    return wrapText(body, type);
  });
};

export function getArtifactDescription(data: AppArtifact, modifier: { description: ArtifactModifierDescription }) {
  return parseArtifactDescription(
    Array_.toArray(modifier.description).reduce<string>((acc, description) => {
      return `${acc} ${typeof description === "string" ? description : data.descriptions[description] || ""}`;
    }, "")
  );
}
