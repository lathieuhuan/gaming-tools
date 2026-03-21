import { Array_ } from "ron-utils";

import type { CharacterCalc } from "@/models";
import type {
  AppCharacter,
  AttackPattern,
  AttackReaction,
  CalcItemFactor,
  AttackElement,
  TalentCalcItem,
} from "@/types";

import { Character } from "@/models";
import { TargetCalc } from "@/models/TargetCalc";
import { CalcResultAttackItem } from "@/calculation/types";
import { makeAttackItemCalc } from "@/calculation/core/makeAttackItemCalc";
import { ResultRecorder } from "@/calculation/core/ResultRecorder";

type AlterConfig = {
  attPatt?: AttackPattern;
  attElmt?: AttackElement;
  reaction?: AttackReaction;
};

export function talentCalc(
  performer: CharacterCalc,
  target: TargetCalc,
  expectAttPatt: AttackPattern
) {
  const { vision, weaponType } = performer.data;
  const isESorEB = expectAttPatt === "ES" || expectAttPatt === "EB";

  const defaultValues = getDefaultValues(performer.data, expectAttPatt);
  const level = performer.getFinalTalentLv(isESorEB ? expectAttPatt : "NAs");

  function getBases(
    item: {
      factor: CalcItemFactor | CalcItemFactor[];
      jointFactors?: boolean;
    },
    multBonus = 0,
    recorder: ResultRecorder
  ) {
    const bases: number[] = [];

    for (const factor of Array_.toArray(item.factor)) {
      const {
        root,
        scale = defaultValues.scale,
        basedOn = defaultValues.basedOn,
      } = parseFactor(factor);
      const value = performer.getAttr(basedOn);
      const totalMult = root * Character.getTalentMult(scale, level) + multBonus;

      bases.push((value * totalMult) / 100);

      recorder.record({
        factors: recorder.data.factors.concat({
          value,
          label: basedOn,
          mult: totalMult,
        }),
      });
    }

    return item.jointFactors ? [bases.reduce((acc, base) => acc + base, 0)] : bases;
  }

  function calcAttackItem(item: TalentCalcItem, alter: AlterConfig): CalcResultAttackItem {
    const attPatt = alter.attPatt || item.attPatt || defaultValues.attPatt;
    let attElmt: AttackElement;
    const reaction = alter.reaction;

    switch (item.attElmt) {
      case "absorb":
        attElmt = alter.attElmt || "anemo";
        break;

      case undefined:
        if (isESorEB) {
          attElmt = alter.attElmt || vision;
        } else if (weaponType === "catalyst" || item.subAttPatt === "FCA") {
          attElmt = vision;
        } else {
          attElmt = alter.attElmt || "phys";
        }
        break;

      default:
        attElmt = item.attElmt;
        break;
    }

    const recorder = new ResultRecorder(
      {
        exclusives: performer.attkBonusCtrl.collectExclusiveBonuses(item.id),
      },
      true
    );

    const { getBonus, calculate } = makeAttackItemCalc(performer, target, {
      attElmt,
      attPatt,
      reaction,
      itemId: item.id,
    });

    const bases = getBases(item, getBonus("mult_"), recorder);

    return calculate(bases, recorder);
  }

  return {
    talent: expectAttPatt,
    calcAttackItem,
  };
}

export type TalentCalculator = ReturnType<typeof talentCalc>;

function getDefaultValues(data: AppCharacter, expectAttPatt: AttackPattern) {
  const {
    scale = expectAttPatt === "ES" || expectAttPatt === "EB" || data.weaponType === "catalyst"
      ? 2
      : 7,
    basedOn = "atk",
    attPatt = expectAttPatt,
  } = data.calcListConfig?.[expectAttPatt] || {};

  return {
    scale,
    basedOn,
    attPatt,
    flatFactorScale: 3,
  };
}

function parseFactor(factor: CalcItemFactor) {
  return typeof factor === "number" ? { root: factor } : factor;
}
