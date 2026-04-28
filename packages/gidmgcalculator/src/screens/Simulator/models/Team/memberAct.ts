import { Array_ } from "ron-utils";

import type { BareBonus } from "@/types/calculation";
import type { BonusSpec } from "@/types/modifier-specs";
import type { AttackBonus, AttackBonusGroupId } from "../Member";
import type { Team } from "./Team";

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

  function receiveBuff(groupId: AttackBonusGroupId, effects: BuffEffect[], inputs: number[] = []) {
    const bonuses: AttackBonus[] = [];

    for (const effect of effects) {
      const { outsource, targets: target } = effect.spec;
      let value = effect.bonus.value;

      if (outsource) {
        const stacks = new BonusCalc(member, team, { inputs }).getStacks(outsource.stacks);

        value *= stacks?.value ?? 1;
      }

      switch (target.module) {
        case "ATTR": {
          break;
        }
        case "TLT": {
          break;
        }
        default:
          for (const module of Array_.toArray(target.module)) {
            bonuses.push({
              groupId,
              toType: module,
              toKey: target.path,
              value,
              label: "",
            });
          }
      }
    }

    if (!bonuses.length) {
      return false;
    }

    member.attkBonusCtrl.add(groupId, bonuses);
    return true;
  }

  // function processToStat(
  //   path: AttributeTargetPath,
  //   receiver: Member,
  //   inputs: number[],
  //   inpIndex: number
  // ): AttributeBonus["toStat"] | undefined {
  //   switch (path) {
  //     case "INP_ELMT": {
  //       const elmtIndex = inputs[inpIndex] ?? 0;
  //       return ELEMENT_TYPES[elmtIndex];
  //     }
  //     case "OWN_ELMT": {
  //       return receiver.data.vision;
  //     }
  //     case "P/H/E/C": {
  //       return PHEC_ELEMENT_TYPES.find((elmt) => team.state.elmtCount.has(elmt));
  //     }
  //     default:
  //       return path;
  //   }
  // }

  // function receiveBonus(bonus: BareBonus, spec: BonusSpec, inputs: number[] = []) {
  //   const { outsource, targets: target } = spec;

  //   if (outsource) {
  //     const stacksSpec = outsource.stacks;
  //     const stacks = new BonusCalc(member, team, { inputs }).getStacks(stacksSpec);

  //     bonus = {
  //       ...bonus,
  //       value: bonus.value * (stacks?.value ?? 1),
  //     };
  //   }

  //   switch (target.module) {
  //     case "ATTR": {
  //       for (const targetPath of Array_.toArray(target.path)) {
  //         const toStat = processToStat(targetPath, member, inputs, target.inpIndex ?? 0);
  //         if (!toStat) continue;

  //         member.receiveAttrBonus({
  //           ...bonus,
  //           toStat,
  //           label: "",
  //           effectSrc: spec,
  //         });
  //       }
  //       break;
  //     }
  //     case "TLT": {
  //       if (!spec.id) return;

  //       member.lvBonusCtrl.set(spec.id, {
  //         id: spec.id,
  //         toType: target.path,
  //         value: bonus.value,
  //         label: "",
  //       });
  //       break;
  //     }
  //     default:
  //       for (const module of Array_.toArray(target.module)) {
  //         member.receiveAttkBonus({
  //           toType: module,
  //           toKey: target.path,
  //           value: bonus.value,
  //           label: "",
  //           effectSrc: spec,
  //         });
  //       }
  //   }
  // }

  return {
    performBuff,
    receiveBuff,
  };
}
