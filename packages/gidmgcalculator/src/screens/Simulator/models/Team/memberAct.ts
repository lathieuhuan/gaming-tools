import { Array_ } from "ron-utils";

import type { AttributeBonus, BareBonus, BonusPerformTools } from "@/types/calculation";
import type { AttributeTargetPath, BonusCoreSpec, BonusSpec } from "@/types/modifier-specs";
import type { Member } from "../Member";
import type { Team } from "./Team";

import { ELEMENT_TYPES, PHEC_ELEMENT_TYPES } from "@/constants/global";
import { BonusCalc } from "./BonusCalc";

export function memberAct(memberCode: number, team: Team) {
  const member = team.getMember(memberCode);

  function performBonus(bonus: BonusCoreSpec, tools: Partial<BonusPerformTools>) {
    return new BonusCalc(member, team, tools).makeBonus(bonus);
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

  function receiveBonus(bonus: BareBonus, spec: BonusSpec, inputs: number[] = []) {
    const { outsource, targets: target } = spec;

    if (outsource) {
      const stacksSpec = outsource.stacks;
      const stacks = new BonusCalc(member, team, { inputs }).getStacks(stacksSpec);

      bonus = {
        ...bonus,
        value: bonus.value * (stacks?.value ?? 1),
      };
    }

    switch (target.module) {
      case "ATTR": {
        for (const targetPath of Array_.toArray(target.path)) {
          const toStat = processToStat(targetPath, member, inputs, target.inpIndex ?? 0);
          if (!toStat) continue;

          member.receiveAttrBonus({
            ...bonus,
            toStat,
            label: "",
            effectSrc: spec,
          });
        }
        break;
      }
      case "TLT": {
        if (!spec.id) return;

        member.lvBonusCtrl.set(spec.id, {
          id: spec.id,
          toType: target.path,
          value: bonus.value,
          label: "",
        });
        break;
      }
      default:
        for (const module of Array_.toArray(target.module)) {
          member.receiveAttkBonus({
            toType: module,
            toKey: target.path,
            value: bonus.value,
            label: "",
            effectSrc: spec,
          });
        }
    }
  }

  return {
    performBonus,
    receiveBonus,
  };
}
