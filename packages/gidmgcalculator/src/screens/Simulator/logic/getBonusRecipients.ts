import type { ModAffectType } from "@/types";
import type { Member } from "../models/Member";
import type { Team } from "../models/Team";

type GetBonusRecipientsOptions = {
  collector?: Set<Member>;
};

export function getBonusRecipients(
  performer: Member,
  team: Team,
  affect: ModAffectType = "SELF",
  options: GetBonusRecipientsOptions = {}
) {
  const collector = options.collector;
  const recipients: Member[] = [];

  switch (affect) {
    case "SELF": {
      recipients.push(performer);
      collector?.add(performer);
      break;
    }
    case "TEAMMATE": {
      team.memberList.forEach((member) => {
        if (member !== performer) {
          recipients.push(member);
          collector?.add(member);
        }
      });
      break;
    }
    case "PARTY": {
      team.memberList.forEach((member) => {
        recipients.push(member);
        collector?.add(member);
      });
      break;
    }
    case "ACTIVE_UNIT": {
      recipients.push(team.onFieldMember);
      collector?.add(team.onFieldMember);
      break;
    }
    case "ONE_UNIT": {
      // TODO
      break;
    }
    default:
      affect satisfies never;
  }

  return recipients;
}
