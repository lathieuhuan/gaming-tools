import { Array_ } from "ron-utils";

import type {
  AttributeBonus,
  AttributeTargetPath,
  BareBonus,
  BonusOutsourceSpec,
  BonusPerformTools,
  BonusSpec,
  BonusTargetSpec,
} from "@/types";
import type { BonusGroupMeta, Member } from "../models/Member";
import type { Team } from "../models/Team";

import { ELEMENT_TYPES, PHEC_ELEMENT_TYPES } from "@/constants/global";
import { BonusCalc } from "../models/EffectValueCalcs";

type ReceiveBonusOptions = {
  inputs?: number[];
  outsource?: BonusOutsourceSpec;
};

export function memberAct(member: Member, team: Team) {
  //
  function performBonus(spec: BonusSpec, tools: Partial<BonusPerformTools> = {}) {
    tools = {
      ...tools,
      basedOnFixed: tools.basedOnFixed ?? spec.target.module === "ATTR",
    };

    return new BonusCalc(member, team, tools).makeBonus(spec);
  }

  function resolveBonusTargetPath(
    path: AttributeTargetPath,
    inputs: number[] = [],
    inpIndex: number = 0
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
    target: BonusTargetSpec,
    options: ReceiveBonusOptions = {}
  ) {
    const { inputs = [], outsource } = options;
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
          const toStat = resolveBonusTargetPath(path, inputs, target.inpIndex);
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
    resolveBonusTargetPath,
    performBonus,
    receiveBonus,
  };
}

export type MemberAct = ReturnType<typeof memberAct>;
