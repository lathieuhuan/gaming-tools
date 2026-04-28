import { Array_ } from "ron-utils";

import type {
  AttributeTargetPath,
  BareBonus,
  BonusSpec,
  BonusTargetSpec,
  ModAffectType,
} from "@/types";
import type { AttributeBonus, BonusGroupMeta, Member } from "../Member";
import type { Team } from "./Team";

import { ELEMENT_TYPES, PHEC_ELEMENT_TYPES } from "@/constants";
import { memberAct } from "./memberAct";
import { memberCan } from "./memberCan";
import { memberShow } from "./memberShow";

type PartitionBonusSpecsOptions = {
  inputs?: number[];
  defaultAffect?: ModAffectType;
};

export type PartitionedItem = {
  spec: BonusSpec;
  affect: ModAffectType;
};

export function teamOperations(team: Team) {
  //
  function partitionBonusSpecs(
    performerCode: number,
    specs: BonusSpec | BonusSpec[],
    options: PartitionBonusSpecsOptions = {}
  ) {
    const { inputs = [], defaultAffect = "SELF" } = options;

    const tltItems: PartitionedItem[] = [];
    const attrItems: PartitionedItem[] = [];
    const attkItems: PartitionedItem[] = [];

    const can = memberCan(performerCode, team);

    for (const spec of Array_.toArray(specs)) {
      if (!can.performEffect(spec, inputs)) {
        continue;
      }

      const item: PartitionedItem = {
        spec,
        affect: spec.affect ?? defaultAffect,
      };

      switch (spec.targets.module) {
        case "TLT": {
          tltItems.push(item);
          break;
        }
        case "ATTR": {
          attrItems.push(item);
          break;
        }
        default: {
          attkItems.push(item);
          break;
        }
      }
    }

    return { tltItems, attrItems, attkItems };
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

  function deliverBonus(
    meta: BonusGroupMeta,
    bonus: BareBonus,
    recipients: Member[],
    target: BonusTargetSpec,
    inputs: number[] = []
  ) {
    switch (target.module) {
      case "ATTR": {
        for (const path of Array_.toArray(target.path)) {
          for (const recipient of recipients) {
            const toStat = processToStat(path, recipient, inputs, target.inpIndex ?? 0);
            if (!toStat) continue;

            recipient.bonusCtrl.addAttrBonus(meta, {
              type: "ATTR",
              groupId: meta.id,
              toStat,
              value: bonus.value,
              isDynamic: bonus.isDynamic,
            });
          }
        }
        break;
      }
      case "TLT": {
        //
        break;
      }
      default: {
        for (const module of Array_.toArray(target.module)) {
          for (const recipient of recipients) {
            recipient.bonusCtrl.addAttkBonus(meta, {
              type: "ATTK",
              groupId: meta.id,
              toType: module,
              toKey: target.path,
              value: bonus.value,
            });
          }
        }
      }
    }
  }

  return {
    act: (memberCode: number) => memberAct(memberCode, team),
    can: (memberCode: number) => memberCan(memberCode, team),
    show: (memberCode: number) => memberShow(memberCode, team),
    partitionBonusSpecs,
    deliverBonus,
  };
}

export type TeamOperations = ReturnType<typeof teamOperations>;
