import type { MemberAct } from "../../logic/memberAct";
import type { MemberCan } from "../../logic/memberCan";
import type { MemberShow } from "../../logic/memberShow";
import type { Member } from "../Member";
import type { Team } from "./Team";

export type MemberOperations = {
  member: Member;
  team: Team;
  act: MemberAct;
  can: MemberCan;
  show: MemberShow;
};
