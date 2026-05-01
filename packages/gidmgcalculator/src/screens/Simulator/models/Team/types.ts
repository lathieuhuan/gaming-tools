import type { MemberAct } from "../../logic/memberAct";
import type { MemberCan } from "../../logic/memberCan";
import type { MemberShow } from "../../logic/memberShow";

export type MemberOperations = {
  act: MemberAct;
  can: MemberCan;
  show: MemberShow;
};
