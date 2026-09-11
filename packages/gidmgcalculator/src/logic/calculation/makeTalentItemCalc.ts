import { Array_ } from "ron-utils";

import type { GetAttackBonusPaths, Target } from "@/models";
import type {
  AttackAlter,
  AttackElement,
  CalcItemDefaultValues,
  ElementType,
  ElementalEvent,
  LevelableTalentType,
  TalentCalcItem,
} from "@/types";
import type { CalcAttackItemOutputs, CalcItemFactor, CalcOtherItemOutputs } from "./types";

import { Character } from "@/models";
import { calcAttack } from "./calcAttack";
import { calcOther } from "./calcOther";
import { DEFAULT_CALC_OTHER_OUTPUTS } from "./constants";

type SeparateCalcItemBase = CalcItemFactor & {
  value: number;
};

type JointCalcItemBase = {
  value: number;
  factors: CalcItemFactor[];
};

export function makeTalentItemCalc(
  performer: Character,
  target: Target,
  talentType: LevelableTalentType | null,
  default_: CalcItemDefaultValues,
  alter: AttackAlter = {},
) {
  const { attkBonusCtrl } = performer;
  const { vision, weaponType } = performer.data;
  const talentLv = talentType ? performer.finalTalentLv(talentType) : 0;

  function calcBases(
    item: TalentCalcItem,
    extraMult: number,
  ): SeparateCalcItemBase[] | JointCalcItemBase {
    const bases: SeparateCalcItemBase[] = [];

    for (const factor of Array_.toArray(item.factor)) {
      const {
        root,
        scale = default_.scale,
        basedOn = default_.basedOn,
      } = typeof factor === "number" ? { root: factor } : factor;

      const attribute = performer.getAttr(basedOn);
      const multiplier = root * Character.getTalentMult(scale, talentLv) + extraMult;

      bases.push({
        value: (attribute * multiplier) / 100,
        attribute: basedOn,
        multiplier,
      });
    }

    if (item.jointFactors) {
      const jointBase: JointCalcItemBase = {
        value: 0,
        factors: [],
      };

      for (const base of bases) {
        const { value, ...factor } = base;

        jointBase.value += value;
        jointBase.factors.push(factor);
      }

      return jointBase;
    }

    return bases;
  }

  function calcAttackItem(
    item: TalentCalcItem,
    attElmtAlter: ElementType | undefined,
    elmtEvent: ElementalEvent,
  ): CalcAttackItemOutputs {
    const { absorption, absorbReaction, infusion, infuseReaction } = elmtEvent;

    const attPatt = alter.attPatt || item.attPatt || default_.attPatt;
    let attElmt: AttackElement;
    let reaction = elmtEvent.reaction;

    {
      // AttackElement priority:
      // 0. item element alter
      // 1. anemo absorption
      // 2. NAs of (catalyst) or FCA
      // 3. item.attElmt
      // 4. infusedElmt (custom infusion) (if NAs)
      // 5. alter
      // 6. phys (if NAs) | performer.vision (otherwise)

      if (attElmtAlter) {
        attElmt = attElmtAlter;
      } //
      else if (item.attElmt === "absorb") {
        // 1. this attack can absorb element (anemo abilities) but user may not activate absorption
        attElmt = absorption || "anemo";
        reaction = absorbReaction;
      } //
      else if (talentType === "NAs") {
        // 2. The element of these attacks is the same as the character's element (vision)
        if (weaponType === "catalyst" || item.subAttPatt === "FCA") {
          attElmt = vision;
        } // 3.
        else if (item.attElmt) {
          attElmt = item.attElmt;
        }
        // 4. There is Custom (external) Infusion
        else if (infusion) {
          attElmt = infusion;
          reaction = infuseReaction;

          // if external infusion is the same as self infusion or character's element,
          // infuse_reaction should be null and reaction (default) should be used instead
          if (infusion === alter.attElmt || infusion === vision) {
            reaction = elmtEvent.reaction;
          }
        } // 5.
        else {
          attElmt = alter.attElmt || "phys";
        }
      } // 6.
      else {
        attElmt = item.attElmt || alter.attElmt || vision;
      }
    }

    const attPattPaths: GetAttackBonusPaths =
      attPatt !== "none" ? [attPatt, `${attPatt}.${attElmt}`] : [];

    const extraMult = attkBonusCtrl.get("mult_", ["all", item.id, attElmt, ...attPattPaths]);

    let bases: number[] = [];
    let factors: CalcItemFactor[] = [];

    const itemBases = calcBases(item, extraMult);

    if (Array.isArray(itemBases)) {
      bases = itemBases.map((base) => base.value);
      factors = itemBases.map((base) => ({
        attribute: base.attribute,
        multiplier: base.multiplier,
      }));
    } else {
      bases = [itemBases.value];
      factors = itemBases.factors;
    }

    const result = calcAttack(performer, target, bases, {
      itemId: item.id,
      attElmt,
      attPatt,
      reaction,
    });

    return Object.assign(result, { factors });
  }

  function calcOtherItem(item: TalentCalcItem): CalcOtherItemOutputs {
    const { flatFactor } = item;

    let flat = 0;

    if (flatFactor) {
      const { root, scale = default_.flatFactorScale } =
        typeof flatFactor === "number" ? { root: flatFactor } : flatFactor;

      const extraBase = root * Character.getTalentMult(scale, talentLv);

      flat += extraBase;
    }

    const extraTalentMult = attkBonusCtrl.get("mult_", [item.id]);
    const itemBases = calcBases(item, extraTalentMult);

    let baseValue = 0;
    let factor: CalcItemFactor;

    if (Array.isArray(itemBases)) {
      baseValue = itemBases[0].value;
      factor = {
        attribute: itemBases[0].attribute,
        multiplier: itemBases[0].multiplier,
      };
    } else {
      baseValue = itemBases.value;
      factor = itemBases.factors[0];
    }

    if (item.type === undefined || item.type === "attack") {
      return { ...DEFAULT_CALC_OTHER_OUTPUTS, ...factor };
    }

    const result = calcOther(performer, item.type, baseValue, {
      itemId: item.id,
      flatBonus: flat,
    });

    return Object.assign(result, factor);
  }

  return {
    calcAttackItem,
    calcOtherItem,
  };
}
