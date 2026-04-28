import type { WritableDraft } from "immer/src/internal.js";

import type { TargetCalc } from "@/models";
import type { AttackElement, AttackReaction, LunarType, ModAffectType } from "@/types";
import type {
  AbilityBuffEvent,
  AbilityHitEvent,
  MemberEvent,
  SimulationEvent,
  SwitchInEvent,
} from "../types";

import { BonusGroupMeta, Member } from "@/screens/Simulator/models/Member";
import { talentCalc } from "../logic/talentCalc";
import { PartitionedItem, Team } from "./Team";

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
  #onFieldCode: number;

  public team: Team;

  get hitLogs() {
    return this.#hitLogs;
  }

  get onFieldCode(): number {
    return this.#onFieldCode;
  }

  constructor(members: Map<number, Member>, public target: TargetCalc, onFieldMember: number) {
    this.#onFieldCode = onFieldMember;
    this.team = new Team(members);
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

    this.team = new Team(memberClones);

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

    this.#onFieldCode = performer.code;
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

  private getRecipients(performerCode: number, affect: ModAffectType) {
    const performer = this.team.getMember(performerCode);
    let members: Member[] = [];

    switch (affect) {
      case "SELF": {
        members.push(performer);
        break;
      }
      case "TEAMMATE": {
        members = this.team.memberList.filter((member) => member !== performer);
        break;
      }
      case "PARTY": {
        members = this.team.memberList;
        break;
      }
      case "ACTIVE_UNIT": {
        members.push(this.team.getMember(this.#onFieldCode));
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

  processBonus(
    performerCode: number,
    meta: BonusGroupMeta,
    items: PartitionedItem[],
    inputs: number[] = []
  ) {
    const { ops } = this.team;

    for (const item of items) {
      const bonus = ops.act(performerCode).performBonus(item.spec, inputs);
      if (!bonus.value) continue;

      const recipients = this.getRecipients(performerCode, item.affect);

      ops.deliverBonus(meta, bonus, recipients, item.spec.targets, inputs);
    }
  }

  processAbilityBuffEvent(event: AbilityBuffEvent) {
    const { team } = this;
    const { ops } = team;
    const performer = team.getMember(event.performer);
    const buff = performer.data.buffs?.find((buff) => buff.index === event.modId);

    if (!buff) {
      // TODO handle error not found
      console.warn(`Buff not found: ${performer.data.name} / ${event.modId}`);
      return;
    }

    if (!ops.can(performer.code).performEffect(buff, event.inputs)) {
      // TODO handle error not valid
      console.warn(`Buff not valid: ${performer.data.name} / ${buff.src}`);
      return;
    }

    if (!buff.effects) return;

    const { tltItems, attrItems, attkItems } = ops.partitionBonusSpecs(
      performer.code,
      buff.effects,
      {
        inputs: event.inputs,
        defaultAffect: buff.affect,
      }
    );

    if (!tltItems.length && !attrItems.length && !attkItems.length) {
      console.info(`No available effects: ${performer.data.name} / ${buff.src}`);
      return;
    }

    const meta: BonusGroupMeta = {
      id: buff.index,
      src: `${performer.data.name} / ${buff.src}`,
    };

    this.processBonus(performer.code, meta, tltItems, event.inputs);
  }
}
