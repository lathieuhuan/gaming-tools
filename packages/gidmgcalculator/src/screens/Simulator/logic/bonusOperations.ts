import type { BareBonus, BonusPerformTools, BonusSpec } from "@/types";
import type { BonusGroupMeta, Member } from "../models/Member";
import type { Team } from "../models/Team";

import { getBonusRecipients } from "./getBonusRecipients";

type BonusOperationsTools = Partial<BonusPerformTools>;

/**
 * @param tools.refi - required for weapon bonuses
 */
export function bonusOperations(performer: Member, team: Team, tools?: BonusOperationsTools) {
  const allRecipients = new Set<Member>();
  const performerOps = team.getMemberOps(performer);

  function applyBonusSpecs(meta: BonusGroupMeta, specs: BonusSpec[]) {
    for (const spec of specs) {
      const bonus = performerOps.act.performBonus(spec, tools);

      const recipients = getBonusRecipients(performer, team, spec.affect || meta.affect, {
        collector: allRecipients,
      });

      deliverBonus(meta, bonus, spec, recipients);
    }
  }

  function deliverBonus(
    meta: BonusGroupMeta,
    bonus: BareBonus,
    spec: BonusSpec,
    recipients: Member[]
  ) {
    if (!bonus.value) return;

    for (const recipient of recipients) {
      const recipientOps = team.getMemberOps(recipient);

      if (!recipientOps.can.receiveBonus(spec)) {
        continue;
      }

      recipientOps.act.receiveBonus(meta, bonus, spec.target, {
        inputs: tools?.inputs,
        outsource: spec.outsource,
      });
    }
  }

  return {
    allRecipients,
    applyBonusSpecs,
    deliverBonus,
  };
}
