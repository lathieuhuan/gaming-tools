import type { Clonable } from "@/models/interfaces";
import type { AutoRsnElmtType, ElementCount, ElementType } from "@/types";
import type { MemberOperations } from "./types";

import { FlatGetters } from "@/decorators/FlatGetters.decorator";
import { $AppCharacter } from "@/services";

import { createWeapon } from "@/logic/entity.logic";
import { memberAct } from "../../logic/memberAct";
import { memberCan } from "../../logic/memberCan";
import { memberShow } from "../../logic/memberShow";
import { applyInnateBonuses } from "./applyInnateBonuses";

import { Member } from "../Member";
import { TeamState } from "./TeamState";

@FlatGetters("state", ["resonances", "moonsignLv", "witchRiteLv", "elmtCount"])
export class Team implements Clonable<Team> {
  private members: Map<number, Member>;
  private onFieldMemberCode: number;

  state: TeamState;

  declare resonances: AutoRsnElmtType[];
  declare moonsignLv: number;
  declare witchRiteLv: number;
  declare elmtCount: ElementCount;

  get memberList() {
    return Array.from(this.members.values());
  }

  get onFieldMember() {
    return this.getMember(this.onFieldMemberCode);
  }

  constructor(members: Member[] | Map<number, Member> = [], onFieldMember: number) {
    this.members = new Map();

    for (const member of members.values()) {
      this.setMember(member);
    }

    this.onFieldMemberCode = onFieldMember;
    this.state = new TeamState(this.members);
  }

  init() {
    this.members.forEach((member) => {
      member.initCalculation();
    });

    applyInnateBonuses(this);

    this.members.forEach((member) => {
      member.finalizeAttrs();
    });
  }

  static createMember(code: number) {
    const data = $AppCharacter.get(code);
    const weapon = createWeapon({ type: data.weaponType });

    return new Member(code, data, weapon);
  }

  setOnFieldMember(member: number | Member) {
    this.onFieldMemberCode = typeof member === "number" ? member : member.code;
  }

  hasMember(code: number) {
    return this.members.has(code);
  }

  getMember(code: number) {
    const member = this.members.get(code);

    if (!member) {
      console.error(`Member with code ${code} not found`);
      return Team.createMember(code);
    }

    return member;
  }

  setMember(member: Member) {
    if (!this.members.has(member.code) && this.members.size >= 4) {
      console.error("Team is already full");
      return false;
    }

    this.members.set(member.code, member);
    this.state = new TeamState(this.members);

    return true;
  }

  removeMember(code: number) {
    const success = this.members.delete(code);

    if (!success) {
      return false;
    }

    this.state = new TeamState(this.members);

    return true;
  }

  getMemberOps(member: Member): MemberOperations {
    return {
      act: memberAct(member, this),
      can: memberCan(member, this),
      show: memberShow(member, this),
    };
  }

  finalizeMembers() {
    this.members.forEach((member) => {
      member.finalizeAttrs();
    });
  }

  clone() {
    const members = Array.from(this.members.values(), (member) => member.clone());

    return new Team(members, this.onFieldMemberCode);
  }

  //

  getMixedCount(performerElmt: ElementType) {
    let count = 0;

    for (const member of this.members.values()) {
      const { nation, vision } = member.data;

      if (nation === "natlan" || vision !== performerElmt) {
        count++;
      }
    }

    return count;
  }
}
