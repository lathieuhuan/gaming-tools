import { Array_ } from "ron-utils";

import type {
  AppCharacter,
  AttackElement,
  AttackPattern,
  AttackReaction,
  CalcItemFactor,
  TalentCalcItem,
} from "@/types";

import { ResultRecorder } from "@/calculation/core/ResultRecorder";
import { TargetCalc } from "@/models/TargetCalc";
import { Member } from "@/screens/Simulator/models/Member";
import { makeAttackItemCalc } from "./makeAttackItemCalc";

type AlterConfig = {
  attPatt?: AttackPattern;
  attElmt: AttackElement | null;
  reaction: AttackReaction;
};

export function talentCalc(performer: Member, target: TargetCalc, expectAttPatt: AttackPattern) {
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
      const totalMult = root * Member.getTalentMult(scale, level) + multBonus;

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

  function attackCalc(item: TalentCalcItem) {
    let defaultAttElmt: AttackElement;

    switch (item.attElmt) {
      case "absorb":
        defaultAttElmt = "anemo";
        break;

      case undefined:
        defaultAttElmt =
          isESorEB || weaponType === "catalyst" || item.subAttPatt === "FCA" ? vision : "phys";
        break;

      default:
        defaultAttElmt = item.attElmt;
        break;
    }

    function calculate(alter?: AlterConfig) {
      const attPatt = alter?.attPatt || item.attPatt || defaultValues.attPatt;
      const attElmt: AttackElement = alter?.attElmt || defaultAttElmt;
      const reaction = alter?.reaction;

      const recorder = new ResultRecorder(
        {
          exclusives: performer.bonusCtrl.collectExclusiveBonuses(item.id),
        },
        true
      );

      const { getBonus, calculate } = makeAttackItemCalc(performer, target, {
        attPatt,
        attElmt,
        reaction,
        itemId: item.id,
      });

      const bases = getBases(item, getBonus("mult_"), recorder);

      return calculate(bases, recorder);
    }

    return {
      defaultAttElmt,
      calculate,
    };
  }

  return {
    talent: expectAttPatt,
    attackCalc,
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
