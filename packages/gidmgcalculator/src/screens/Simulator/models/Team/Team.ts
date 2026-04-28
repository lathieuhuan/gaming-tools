import type { Clonable } from "@/models/interfaces";
import type { AutoRsnElmtType, ElementCount, ElementType } from "@/types";

import { FlatGetters } from "@/decorators/FlatGetters.decorator";
import { createWeapon } from "@/logic/entity.logic";
import { Member } from "@/screens/Simulator/models/Member";
import { $AppCharacter } from "@/services";
import { teamOperations, TeamOperations } from "./teamOperations";
import { TeamState } from "./TeamState";

@FlatGetters("state", ["resonances", "moonsignLv", "witchRiteLv", "elmtCount"])
export class Team implements Clonable<Team> {
  private members: Map<number, Member>;

  state: TeamState;
  ops: TeamOperations;

  declare resonances: AutoRsnElmtType[];
  declare moonsignLv: number;
  declare witchRiteLv: number;
  declare elmtCount: ElementCount;

  get memberList() {
    return Array.from(this.members.values());
  }

  constructor(members: Member[] | Map<number, Member> = []) {
    this.members = new Map();

    for (const member of members.values()) {
      this.setMember(member);
    }

    this.state = new TeamState(this.members);
    this.ops = teamOperations(this);
  }

  static createMember(code: number) {
    const data = $AppCharacter.get(code);
    const weapon = createWeapon({ type: data.weaponType });

    return new Member(code, data, weapon);
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

  clone() {
    const members = Array.from(this.members.values(), (member) => member.clone());

    return new Team(members);
  }

  // prepare() {
  //   const levelBonuses: TalentLevelBonus[] = [];

  //   if (this.members.has(26)) {
  //     // "Tartaglia"
  //     levelBonuses.push({
  //       id: "c26",
  //       toType: "NAs",
  //       value: 1,
  //       label: "Tartaglia",
  //     });
  //   }

  //   if (this.members.has(105)) {
  //     // "Skirk"
  //     const isValid = this.state.isTeamElmtValid({
  //       teamOnlyElmts: ["hydro", "cryo"],
  //       teamEachElmtCount: { hydro: 1, cryo: 1 },
  //     });

  //     if (isValid) {
  //       levelBonuses.push({
  //         id: "c105",
  //         toType: "ES",
  //         value: 1,
  //         label: "Skirk",
  //       });
  //     }
  //   }

  //   this.members.forEach((member) => {
  //     member.initCalculation({
  //       resonanceElmts: this.state.resonances,
  //       levelBonuses,
  //     });
  //   });
  // }

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
