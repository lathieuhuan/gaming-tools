import type { BareBonus, BonusSpec, ModAffectType } from "@/types";
import type { BonusGroupMeta, Member } from "../models/Member";
import type { Team } from "../models/Team";

type ResolvedBonusSpec = {
  spec: BonusSpec;
  affect: ModAffectType;
};

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

  function partitionBonusSpecs(specs: BonusSpec[], defaultAffect: ModAffectType = "SELF") {
    const tltSpecs: ResolvedBonusSpec[] = [];
    const attrSpecs: ResolvedBonusSpec[] = [];
    const attkSpecs: ResolvedBonusSpec[] = [];

    for (const spec of specs) {
      if (!performerOps.can.performEffect(spec, inputs)) {
        continue;
      }

      const $spec: ResolvedBonusSpec = {
        spec,
        affect: spec.affect ?? defaultAffect,
      };

      switch (spec.targets.module) {
        case "TLT": {
          tltSpecs.push($spec);
          break;
        }
        case "ATTR": {
          attrSpecs.push($spec);
          break;
        }
        default: {
          attkSpecs.push($spec);
          break;
        }
      }
    }

    return { tltSpecs, attrSpecs, attkSpecs };
  }

  function getAffectedMembers(affect: ModAffectType) {
    let members: Member[] = [];

    switch (affect) {
      case "SELF": {
        members.push(performer);
        break;
      }
      case "TEAMMATE": {
        members = team.memberList.filter((member) => member !== performer);
        break;
      }
      case "PARTY": {
        members = team.memberList;
        break;
      }
      case "ACTIVE_UNIT": {
        members.push(team.onFieldMember);
        break;
      }
      case "SELF_TEAMMATE":
      case "ONE_UNIT": {
        // TODO redundant, remove
        break;
      }
      default:
        affect satisfies never;
    }

    return members;
  }

  function performAndDeliverBonuses(meta: BonusGroupMeta, specs: ResolvedBonusSpec[]) {
    for (const { spec, affect } of specs) {
      const bonus = performerOps.act.performBonus(spec, { inputs, refi });
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

    recipients.forEach((recipient) => {
      const recipientOps = team.getMemberOps(recipient);

      if (!recipientOps.can.receiveBonus(spec)) {
        return;
      }

      recipientOps.act.receiveBonus(meta, bonus, inputs, spec);
    });
  }

  return {
    partitionBonusSpecs,
    getAffectedMembers,
    performAndDeliverBonuses,
    deliverBonus,
  };
}
