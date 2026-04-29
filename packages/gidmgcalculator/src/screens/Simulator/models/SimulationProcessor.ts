import type { WritableDraft } from "immer/src/internal.js";

import type { TargetCalc } from "@/models";
import type { AttackElement, AttackReaction, LunarType } from "@/types";
import type {
  AbilityBuffEvent,
  AbilityHitEvent,
  MemberEvent,
  SimulationEvent,
  SwitchInEvent,
} from "../types";
import type { BonusGroupMeta, Member } from "./Member";

import { bonusOperations } from "../logic/bonusOperations";
import { talentCalc } from "../logic/talentCalc";
import { Team } from "./Team";

export enum EHitLogType {
  MEMBER = "M",
  ENVIRONMENT = "E",
}

type BaseHitLog = {
  value: number;
  attElmt: AttackElement | LunarType;
  reaction?: AttackReaction;
};

type MemberHitLog = BaseHitLog & {
  type: EHitLogType.MEMBER;
  performer: number;
};

type EnvironmentHitLog = BaseHitLog & {
  type: EHitLogType.ENVIRONMENT;
};

type HitLog = MemberHitLog | EnvironmentHitLog;

export class SimulationProcessor {
  #hitLogs: HitLog[] = [];

  public team: Team;

  get hitLogs() {
    return this.#hitLogs;
  }

  constructor(members: Map<number, Member>, public target: TargetCalc, onFieldMember: number) {
    this.team = new Team(members, onFieldMember);
  }

  // TODO optimize
  processTimeline(
    timeline: SimulationEvent[],
    members: Map<number, Member | WritableDraft<Member>>
  ) {
    this.#hitLogs = [];
    this.target = this.target.clone();

    const memberClones = new Map<number, Member>();

    for (const member of members.values()) {
      memberClones.set(member.code, member.deepClone());
    }

    this.team = new Team(memberClones, this.team.onFieldMember.code);

    for (const event of timeline) {
      switch (event.cate) {
        case "M": {
          this.processMemberEvent(event);
          break;
        }
        case "E": {
          // TODO process environment event
          break;
        }
        default:
          event satisfies never;
      }
    }

    this.team.memberList.forEach((member) => {
      this.team.setMember(member.clone());
    });
  }

  // # Member Event

  processMemberEvent(event: MemberEvent) {
    switch (event.type) {
      case "SI": {
        this.processSwitchInEvent(event);
        break;
      }
      case "AH": {
        const log = this.processAbilityHitEvent(event);

        this.#hitLogs.push(log);
        break;
      }
      case "RH": {
        // TODO process reaction hit event
        break;
      }
      case "AB": {
        this.processAbilityBuffEvent(event);
        break;
      }
      case "WB": {
        // TODO process weapon buff event
        break;
      }
      default:
        event satisfies never;
    }
  }

  // ## Switch In Event

  processSwitchInEvent(event: SwitchInEvent) {
    const performer = this.team.getMember(event.performer);

    this.team.setOnFieldMember(performer);
    // TODO redirect on-field buffs to this member
  }

  // ## Ability Hit Event

  processAbilityHitEvent(event: AbilityHitEvent): HitLog {
    const performer = this.team.getMember(event.performer);
    const item = performer.data.calcList[event.talent][event.index];

    const calculator = talentCalc(performer, this.target, event.talent);
    const result = calculator.calcAttackItem(item, {
      attElmt: event.attElmt,
      reaction: event.reaction,
    });
    const value = result.values.reduce((acc, value) => acc + Math.round(value.average), 0);

    return {
      type: EHitLogType.MEMBER,
      performer: event.performer,
      value,
      attElmt: result.attElmt,
      reaction: event.reaction,
    };
  }

  // ## Ability Buff Event

  processAbilityBuffEvent(event: AbilityBuffEvent) {
    const { team } = this;
    const performer = team.getMember(event.performer);
    const performerOps = team.getMemberOps(performer);
    const buff = performer.data.buffs?.find((buff) => buff.index === event.modId);

    if (!buff) {
      // TODO handle error not found
      console.warn(`Buff not found: ${performer.data.name} / ${event.modId}`);
      return;
    }

    if (!performerOps.can.performEffect(buff, event.inputs)) {
      // TODO handle error not valid
      console.warn(`Buff not valid: ${performer.data.name} / ${buff.src}`);
      return;
    }

    if (!buff.effects) return;

    const { effects } = buff;
    const meta: BonusGroupMeta = {
      id: `c${performer.code}-${buff.index}`,
      src: `${performer.data.name} / ${buff.src}`,
    };

    const bonusOps = bonusOperations(performer, this.team, event.inputs);

    if (!Array.isArray(effects)) {
      // Most buffs only have 1 effect
      const bonus = performerOps.act.performBonus(effects, {
        inputs: event.inputs,
      });
      const recipients = bonusOps.getAffectedMembers(buff.affect || effects.affect || "SELF");

      if (!bonus.value) return;

      bonusOps.deliverBonus(meta, bonus, recipients, effects);

      return;
    }

    const { tltSpecs, attrSpecs, attkSpecs } = bonusOps.partitionBonusSpecs(effects, buff.affect);

    if (!tltSpecs.length && !attrSpecs.length && !attkSpecs.length) {
      console.info(`No available effects: ${performer.data.name} / ${buff.src}`);
      return;
    }

    if (attrSpecs.length) {
      bonusOps.performAndDeliverBonuses(meta, attrSpecs);
    }
  }
}
