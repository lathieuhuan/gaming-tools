import type { BareBonus, BonusSpec, ModAffectType } from "@/types";
import type { BonusGroupMeta, Member } from "../models/Member";
import type { Team } from "../models/Team";

const DEFAULT_AFFECT: ModAffectType = "SELF";

/**
 * @param refi - required for weapon bonuses
 */
export function bonusOperations(
  performer: Member,
  team: Team,
  inputs: number[] = [],
  refi?: number
) {
  const performerOps = team.getMemberOps(performer);
  const allRecipients = new Set<Member>();

  function resolveBonusSpecs(specs: BonusSpec[]) {
    const tltSpecs: BonusSpec[] = [];
    const attrSpecs: BonusSpec[] = [];
    const attkSpecs: BonusSpec[] = [];

    for (const spec of specs) {
      if (!performerOps.can.performEffect(spec, inputs)) {
        continue;
      }

      switch (spec.targets.module) {
        case "TLT": {
          tltSpecs.push(spec);
          break;
        }
        case "ATTR": {
          attrSpecs.push(spec);
          break;
        }
        default: {
          attkSpecs.push(spec);
          break;
        }
      }
    }

    return tltSpecs.concat(attrSpecs, attkSpecs);
  }

  function getAffectedMembers(affect: ModAffectType = DEFAULT_AFFECT) {
    const members: Member[] = [];

    switch (affect) {
      case "SELF": {
        members.push(performer);
        allRecipients.add(performer);
        break;
      }
      case "TEAMMATE": {
        team.memberList.forEach((member) => {
          if (member !== performer) {
            members.push(member);
            allRecipients.add(member);
          }
        });
        break;
      }
      case "PARTY": {
        team.memberList.forEach((member) => {
          members.push(member);
          allRecipients.add(member);
        });
        break;
      }
      case "ACTIVE_UNIT": {
        members.push(team.onFieldMember);
        allRecipients.add(team.onFieldMember);
        break;
      }
      case "ONE_UNIT": {
        // TODO
        break;
      }
      default:
        affect satisfies never;
    }

    return members;
  }

  function performAndDeliverBonuses(
    meta: BonusGroupMeta,
    specs: BonusSpec[],
    parentAffect?: ModAffectType
  ) {
    for (const spec of specs) {
      const bonus = performerOps.act.performBonus(spec, { inputs, refi });

      const { affect = parentAffect } = spec;
      const recipients = getAffectedMembers(affect);

      deliverBonus(meta, bonus, recipients, spec);
    }
  }

  function deliverBonus(
    meta: BonusGroupMeta,
    bonus: BareBonus,
    recipients: Member[],
    spec: BonusSpec
  ) {
    if (!bonus.value) return;

    for (const recipient of recipients) {
      const recipientOps = team.getMemberOps(recipient);

      if (!recipientOps.can.receiveBonus(spec)) {
        continue;
      }

      recipientOps.act.receiveBonus(meta, bonus, inputs, spec);
    }
  }

  return {
    allRecipients,
    resolveBonusSpecs,
    getAffectedMembers,
    performAndDeliverBonuses,
    deliverBonus,
  };
}
