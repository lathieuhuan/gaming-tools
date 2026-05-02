import { Array_ } from "ron-utils";

import type { BonusPerformTools, BonusSpec } from "@/types";
import type { BonusGroupMeta } from "../Member";
import type { MemberOperations } from "../Team";

import { logSection } from "@/utils/window.utils";
import { categorizeBonusSpecs } from "../../logic/categorizeBonusSpecs";
import { getBonusRecipients } from "../../logic/getBonusRecipients";

export function applyMemberBuff(
  meta: BonusGroupMeta,
  specs: BonusSpec | BonusSpec[] | undefined,
  performerOps: MemberOperations,
  tools?: Partial<BonusPerformTools>
) {
  if (!specs) {
    logSection("No specs", ["meta", meta]);
    return false;
  }

  const { member, team } = performerOps;

  const specCates = categorizeBonusSpecs(Array_.toArray(specs), performerOps.can, tools?.inputs);

  if (!specCates) {
    logSection("No available effects", ["meta", meta]);
    return false;
  }

  for (const spec of specCates.rearrange()) {
    const bonus = performerOps.act.performBonus(spec, tools);

    if (!bonus.value) {
      logSection("No bonus value", ["meta", meta], ["spec", spec]);
      continue;
    }

    const recipients = getBonusRecipients(member, team, spec.affect || meta.affect);

    for (const recipient of recipients) {
      const recipientOps = team.getMemberOps(recipient);

      if (!recipientOps.can.receiveBonus(spec)) {
        logSection("Cannot receive bonus", ["recipient", recipient], ["spec", spec], ["meta", meta]);
        continue;
      }

      recipientOps.act.receiveBonus(meta, bonus, spec.target, {
        inputs: tools?.inputs,
        outsource: spec.outsource,
      });
    }
  }

  return true;
}
