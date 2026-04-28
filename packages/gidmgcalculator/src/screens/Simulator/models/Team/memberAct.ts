import { Array_ } from "ron-utils";

import type { BareBonus } from "@/types/calculation";
import type { AttributeTargetPath, BonusSpec } from "@/types/modifier-specs";
import type { AttackBonus, AttributeBonus, BonusGroupMeta, Member } from "../Member";
import type { Team } from "./Team";

import { ELEMENT_TYPES, PHEC_ELEMENT_TYPES } from "@/constants/global";
import { BonusCalc } from "./BonusCalc";
import { memberCan } from "./memberCan";

type BuffEffect = {
  bonus: BareBonus;
  spec: BonusSpec;
};

export function memberAct(memberCode: number, team: Team) {
  const member = team.getMember(memberCode);

  function performBuff(specs?: BonusSpec | BonusSpec[], inputs: number[] = []) {
    if (!specs) {
      return [];
    }

    const can = memberCan(memberCode, team);
    const effects: BuffEffect[] = [];

    for (const spec of Array_.toArray(specs)) {
      if (!can.performEffect(spec, inputs)) {
        continue;
      }

      const bonus = new BonusCalc(member, team, { inputs }).makeBonus(spec);

      if (bonus.value) {
        effects.push({ bonus, spec });
      }
    }

    return effects;
  }

  function processToStat(
    path: AttributeTargetPath,
    receiver: Member,
    inputs: number[],
    inpIndex: number
  ): AttributeBonus["toStat"] | undefined {
    switch (path) {
      case "INP_ELMT": {
        const elmtIndex = inputs[inpIndex] ?? 0;
        return ELEMENT_TYPES[elmtIndex];
      }
      case "OWN_ELMT": {
        return receiver.data.vision;
      }
      case "P/H/E/C": {
        return PHEC_ELEMENT_TYPES.find((elmt) => team.state.elmtCount.has(elmt));
      }
      default:
        return path;
    }
  }

  function receiveBuff(meta: BonusGroupMeta, effects: BuffEffect[], inputs: number[] = []) {
    const attkBs: AttackBonus[] = [];
    const attrBs: AttributeBonus[] = [];

    for (const effect of effects) {
      const { bonus } = effect;
      const { id, outsource, targets: target } = effect.spec;
      let value = bonus.value;

      if (outsource) {
        const stacks = new BonusCalc(member, team, { inputs }).getStacks(outsource.stacks);

        value *= stacks?.value ?? 1;
      }

      switch (target.module) {
        case "ATTR": {
          for (const path of Array_.toArray(target.path)) {
            const toStat = processToStat(path, member, inputs, target.inpIndex ?? 0);
            if (!toStat) continue;

            attrBs.push({
              groupId: meta.id,
              toStat,
              value,
              isDynamic: bonus.isDynamic,
            });
          }
          break;
        }
        case "TLT": {
          if (id) {
            member.lvlBonusCtrl.set(id, {
              id,
              value: bonus.value,
              toType: target.path,
            });
          }
          break;
        }
        default:
          for (const module of Array_.toArray(target.module)) {
            attkBs.push({
              groupId: meta.id,
              toType: module,
              toKey: target.path,
              value,
            });
          }
      }
    }

    if (!attkBs.length && !attrBs.length) {
      return false;
    }

    member.attrBonusCtrl.add(meta, attrBs);
    member.attkBonusCtrl.add(meta, attkBs);
    return true;
  }

  return {
    performBuff,
    receiveBuff,
  };
}
