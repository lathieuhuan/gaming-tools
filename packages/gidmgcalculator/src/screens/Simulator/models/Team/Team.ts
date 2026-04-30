import type { Clonable } from "@/models/interfaces";
import type { AutoRsnElmtType, BonusSpec, ElementCount, ElementType } from "@/types";

import { FlatGetters } from "@/decorators/FlatGetters.decorator";
import { createWeapon } from "@/logic/entity.logic";
import { $AppCharacter } from "@/services";
import { bonusOperations } from "../../logic/bonusOperations";
import { categorizeBonusSpecs } from "../../logic/categorizeBonusSpecs";
import { memberAct } from "../../logic/memberAct";
import { memberCan } from "../../logic/memberCan";
import { memberShow } from "../../logic/memberShow";
import { BonusGroupMeta, Member, TalentLevelBonus } from "../Member";
import { TeamState } from "./TeamState";

type InnateBonusSpec = {
  meta: BonusGroupMeta;
  ownerCode: number;
  spec: BonusSpec;
};

@FlatGetters("state", ["resonances", "moonsignLv", "witchRiteLv", "elmtCount"])
export class Team implements Clonable<Team> {
  private members: Map<number, Member>;
  private onFieldMemberCode: number;

  state: TeamState;
  innateBonuses: InnateBonusSpec[] = [];

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
    // TODO move to party-wide innate buffs
    const levelBonuses: TalentLevelBonus[] = [];

    if (this.members.has(26)) {
      // "Tartaglia"
      levelBonuses.push({
        id: "c26",
        toType: "NAs",
        value: 1,
      });
    }

    if (this.members.has(105)) {
      // "Skirk"
      const isValid = this.state.isTeamElmtValid({
        teamOnlyElmts: ["hydro", "cryo"],
        teamEachElmtCount: { hydro: 1, cryo: 1 },
      });

      if (isValid) {
        levelBonuses.push({
          id: "c105",
          toType: "ES",
          value: 1,
        });
      }
    }

    const tltSpecs: InnateBonusSpec[] = [];
    const attrSpecs: InnateBonusSpec[] = [];
    const attkSpecs: InnateBonusSpec[] = [];

    this.members.forEach((member) => {
      const { code, innateBuffs = [] } = member.data;
      const can = memberCan(member, this);

      for (const buff of innateBuffs) {
        if (!buff.effects || !can.performEffect(buff)) {
          continue;
        }

        const meta: BonusGroupMeta = {
          id: `c${code}-i`,
          src: `${member.data.name} / ${buff.src}`,
          innate: true,
          affect: buff.affect,
        };
        const specCates = categorizeBonusSpecs(buff.effects, can);

        specCates?.tltSpecs.forEach((spec) => {
          tltSpecs.push({
            meta,
            ownerCode: code,
            spec,
          });
        });

        specCates?.attrSpecs.forEach((spec) => {
          attrSpecs.push({
            meta,
            ownerCode: code,
            spec,
          });
        });

        specCates?.attkSpecs.forEach((spec) => {
          attkSpecs.push({
            meta,
            ownerCode: code,
            spec,
          });
        });
      }
    });

    this.innateBonuses = [...tltSpecs, ...attrSpecs, ...attkSpecs];

    this.members.forEach((member) => {
      member.initCalculation({
        resonanceElmts: this.state.resonances,
        levelBonuses,
      });
    });

    const allRecipients = new Set<Member>();

    for (const { meta, ownerCode, spec } of this.innateBonuses) {
      const member = this.getMember(ownerCode);
      const bonusOps = bonusOperations(member, this, { recipients: allRecipients });

      const bonus = memberAct(member, this).performBonus(spec);
      const recipients = bonusOps.getAffectedMembers(spec.affect || meta.affect);

      bonusOps.deliverBonus(meta, bonus, spec, recipients);
    }

    for (const recipient of allRecipients) {
      recipient.finalizeAttrs();
    }
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

  getMemberOps(member: Member) {
    return {
      act: memberAct(member, this),
      can: memberCan(member, this),
      show: memberShow(member, this),
    };
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
