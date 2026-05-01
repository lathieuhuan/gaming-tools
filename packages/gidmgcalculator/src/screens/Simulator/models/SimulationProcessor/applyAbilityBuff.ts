import { Array_ } from "ron-utils";

import type { CharacterBuff } from "@/types";
import type { BonusGroupMeta } from "../Member";
import type { MemberOperations } from "../Team";

import { categorizeBonusSpecs } from "../../logic/categorizeBonusSpecs";
import { getBonusRecipients } from "../../logic/getBonusRecipients";

export function applyAbilityBuff(
  buff: CharacterBuff,
  performerOps: MemberOperations,
  inputs: number[]
) {
  if (!buff.effects) {
    return false;
  }

  const { member, team } = performerOps;
  const { data } = member;

  const meta: BonusGroupMeta = {
    id: `c${data.code}-${buff.id}`,
    src: `${data.name} / ${buff.src}`,
    affect: buff.affect,
  };

  const specCates = categorizeBonusSpecs(Array_.toArray(buff.effects), performerOps.can);

  if (!specCates) {
    console.info(`No available effects: ${data.name} / ${buff.src}`);
    return false;
  }

  for (const spec of specCates.rearrange()) {
    const bonus = performerOps.act.performBonus(spec, { inputs });
    if (!bonus.value) continue;

    const recipients = getBonusRecipients(member, team, spec.affect || meta.affect);

    for (const recipient of recipients) {
      const recipientOps = team.getMemberOps(recipient);

      if (!recipientOps.can.receiveBonus(spec)) {
        continue;
      }

      recipientOps.act.receiveBonus(meta, bonus, spec.target, {
        inputs,
        outsource: spec.outsource,
      });
    }
  }

  return true;
}
