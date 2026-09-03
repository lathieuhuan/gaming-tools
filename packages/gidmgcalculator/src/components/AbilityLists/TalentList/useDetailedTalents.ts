import { useMemo } from "react";
import { Array_, round } from "ron-utils";

import type { AppCharacter, TalentType } from "@/types";

import { ATTACK_PATTERNS } from "@/constants";
import { getTalentDefaultValues } from "@/logic/calculator";
import { Character } from "@/models/Character";

type DetailedStat = {
  name: string;
  value: string | number;
};

type DetailedTalentType = TalentType | "A1" | "A4" | "utility";

type DetailedTalent = {
  name: string;
  label?: string;
  type: DetailedTalentType;
  stats: DetailedStat[];
};

export function useDetailedTalents(
  character: AppCharacter,
  level: number,
  translate: (word: string) => string,
) {
  return useMemo(() => processTalents(character, level, translate), [character, level, translate]);
}

function processTalents(
  character: AppCharacter,
  level: number,
  translate: (word: string) => string,
): DetailedTalent[] {
  const { NAs, ES, EB, altSprint } = character.activeTalents;

  const result: DetailedTalent[] = [
    { name: NAs.name, type: "NAs", label: translate("NAs"), stats: [] },
    { name: ES.name, type: "ES", label: translate("ES"), stats: [] },
    { name: EB.name, type: "EB", label: translate("EB"), stats: [] },
  ];

  for (const attPatt of ATTACK_PATTERNS) {
    const default_ = getTalentDefaultValues(character, attPatt);
    const resultKey = attPatt === "ES" || attPatt === "EB" ? attPatt : "NAs";
    const talent = result.find((item) => item.type === resultKey);
    if (!talent) continue;

    for (const stat of character.calcList[attPatt]) {
      const factors = Array_.toArray(stat.factor);
      const { flatFactor } = stat;
      const factorStrings = [];

      if (factors.some((factor) => typeof factor !== "number" && factor.scale === 0)) {
        continue;
      }

      for (const factor of factors) {
        const {
          root,
          scale = default_.scale,
          basedOn = default_.basedOn,
        } = typeof factor === "number" ? { root: factor } : factor;

        if (scale && root) {
          let string = round(root * Character.getTalentMult(scale, level), 2) + "%";

          if (basedOn) {
            string += ` ${translate(basedOn)}`;
          }

          factorStrings.push(string);
        }
      }

      if (flatFactor) {
        const { root, scale = default_.flatFactorScale } =
          typeof flatFactor === "number" ? { root: flatFactor } : flatFactor;

        factorStrings.push(Math.round(root * (scale ? Character.getTalentMult(scale, level) : 1)));
      }

      talent.stats.push({
        name: stat.name,
        value: factorStrings.join(" + "),
      });
    }
  }

  result[2].stats.push({
    name: "Energy cost",
    value: character.EBcost,
  });

  if (altSprint) {
    result.push({
      name: altSprint.name,
      type: "altSprint",
      label: translate("altSprint"),
      stats: [],
    });
  }

  const passiveTypes = ["A1", "A4", "utility"] as const;
  const passiveLabels = ["Ascension 1", "Ascension 4", "Utility"];

  result.push(
    ...character.passiveTalents.map<DetailedTalent>((talent, i) => {
      return {
        name: talent.name,
        type: passiveTypes[i],
        label: passiveLabels[i],
        stats: [],
      };
    }),
  );

  return result;
}
