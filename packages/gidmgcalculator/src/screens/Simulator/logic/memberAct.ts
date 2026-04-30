import { Array_ } from "ron-utils";

import type {
  AttributeBonus,
  AttributeTargetPath,
  BareBonus,
  BonusPerformTools,
  BonusSpec,
} from "@/types";
import type { BonusGroupMeta, Member } from "../models/Member";
import type { Team } from "../models/Team";

import { ELEMENT_TYPES, PHEC_ELEMENT_TYPES } from "@/constants/global";
import { BonusCalc } from "../models/EffectValueCalcs";

export function memberAct(member: Member, team: Team) {
  //
  function performBonus(spec: BonusSpec, tools: Partial<BonusPerformTools> = {}) {
    tools = {
      ...tools,
      basedOnFixed: tools.basedOnFixed ?? spec.targets.module === "ATTR",
    };

    return new BonusCalc(member, team, tools).makeBonus(spec);
  }

  function processToStat(
    path: AttributeTargetPath,
    inputs: number[],
    inpIndex: number
  ): AttributeBonus["toStat"] | undefined {
    switch (path) {
      case "INP_ELMT": {
        const elmtIndex = inputs[inpIndex] ?? 0;
        return ELEMENT_TYPES[elmtIndex];
      }
      case "OWN_ELMT": {
        return member.data.vision;
      }
      case "P/H/E/C": {
        return PHEC_ELEMENT_TYPES.find((elmt) => team.state.elmtCount.has(elmt));
      }
      default:
        return path;
    }
  }

  function receiveBonus(
    meta: BonusGroupMeta,
    bonus: BareBonus,
    spec: BonusSpec,
    inputs: number[] = []
  ) {
    const { targets: target, outsource } = spec;
    let value = bonus.value;

    if (outsource) {
      const stacks = new BonusCalc(member, team, { inputs }).getStacks(outsource.stacks);

      value *= stacks?.value ?? 1;
    }

    switch (target.module) {
      case "TLT": {
        //
        break;
      }
      case "ATTR": {
        for (const path of Array_.toArray(target.path)) {
          const toStat = processToStat(path, inputs, target.inpIndex ?? 0);
          if (!toStat) continue;

          member.bonusCtrl.addAttrBonus(meta, {
            type: "ATTR",
            groupId: meta.id,
            toStat,
            value,
            isDynamic: bonus.isDynamic,
          });
        }
        break;
      }
      default: {
        for (const module of Array_.toArray(target.module)) {
          member.bonusCtrl.addAttkBonus(meta, {
            type: "ATTK",
            groupId: meta.id,
            toType: module,
            toKey: target.path,
            value,
          });
        }
      }
    }
  }

  return {
    performBonus,
    receiveBonus,
  };
}

export type MemberAct = ReturnType<typeof memberAct>;