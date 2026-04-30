import type { BareBonus, BonusPerformTools, BonusSpec, ModAffectType } from "@/types";
import type { BonusGroupMeta, Member } from "../models/Member";
import type { Team } from "../models/Team";

const DEFAULT_AFFECT: ModAffectType = "SELF";

type BonusOperationsTools = Partial<BonusPerformTools> & {
  recipients?: Set<Member>;
};

/**
 * @param tools.refi - required for weapon bonuses
 */
export function bonusOperations(performer: Member, team: Team, tools?: BonusOperationsTools) {
  const { recipients = new Set<Member>() } = tools || {};
  const performerOps = team.getMemberOps(performer);

  function getAffectedMembers(affect: ModAffectType = DEFAULT_AFFECT) {
    const members: Member[] = [];

    switch (affect) {
      case "SELF": {
        members.push(performer);
        recipients.add(performer);
        break;
      }
      case "TEAMMATE": {
        team.memberList.forEach((member) => {
          if (member !== performer) {
            members.push(member);
            recipients.add(member);
          }
        });
        break;
      }
      case "PARTY": {
        team.memberList.forEach((member) => {
          members.push(member);
          recipients.add(member);
        });
        break;
      }
      case "ACTIVE_UNIT": {
        members.push(team.onFieldMember);
        recipients.add(team.onFieldMember);
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

  function applyBonusSpecs(meta: BonusGroupMeta, specs: BonusSpec[]) {
    for (const spec of specs) {
      const bonus = performerOps.act.performBonus(spec, tools);
      const recipients = getAffectedMembers(spec.affect || meta.affect);

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

      recipientOps.act.receiveBonus(meta, bonus, spec, tools?.inputs);
    }
  }

  return {
    recipients,
    getAffectedMembers,
    applyBonusSpecs,
    deliverBonus,
  };
}
