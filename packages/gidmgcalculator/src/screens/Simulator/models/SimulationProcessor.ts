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

import { BonusGroupMeta, Member } from "@/screens/Simulator/models/Member";
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

    const updatedMemberCodes = new Set<number>();

    for (const event of timeline) {
      switch (event.cate) {
        case "M": {
          this.processMemberEvent(event).forEach((code) => updatedMemberCodes.add(code));
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

    updatedMemberCodes.forEach((code) => {
      this.team.setMember(this.team.getMember(code).clone());
    });
  }

  // # Member Event

  processMemberEvent(event: MemberEvent) {
    let updatedMemberCodes: number[] = [];

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
        updatedMemberCodes = this.processAbilityBuffEvent(event) || [];
        break;
      }
      case "WB": {
        // TODO process weapon buff event
        break;
      }
      default:
        event satisfies never;
    }

    for (const code of updatedMemberCodes) {
      this.team.getMember(code).attrsCtrl.finalize();
    }

    return updatedMemberCodes;
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

  processAbilityBuffEvent(event: AbilityBuffEvent) {
    const { team } = this;
    const { ops } = team;
    const performer = team.getMember(event.performer);
    const buff = performer.data.buffs?.find((buff) => buff.index === event.modId);

    if (!buff) {
      // TODO handle error not found
      console.warn(`Ability buff event not found: ${event.performer} / ${event.modId}`);
      return;
    }

    if (!ops.can(performer.code).performEffect(buff, event.inputs)) {
      // TODO handle error not valid
      console.warn(`Ability buff event not valid: ${event.performer} / ${event.modId}`);
      return;
    }

    // console.log(`Ability buff event`);
    // console.log(event);

    const { index, affect } = buff;
    const recipientCodes: number[] = [];

    const effects = ops.act(performer.code).performBuff(buff.effects, event.inputs);

    if (!effects.length) {
      console.warn(`Ability buff event has no effects: ${event.performer} / ${event.modId}`);
      return;
    }

    // console.log(effects);

    switch (affect) {
      case "SELF": {
        recipientCodes.push(performer.code);
        break;
      }
      case "TEAMMATE": {
        team.memberList.forEach((member) => {
          if (member.code !== performer.code) {
            recipientCodes.push(member.code);
          }
        });
        break;
      }
      case "SELF_TEAMMATE": {
        break;
      }
      case "PARTY": {
        team.memberList.forEach((member) => {
          recipientCodes.push(member.code);
        });
        break;
      }
      case "ONE_UNIT": {
        break;
      }
      case "ACTIVE_UNIT": {
        recipientCodes.push(this.#onFieldCode);
        break;
      }
      default:
        affect satisfies never;
    }

    const meta: BonusGroupMeta = {
      id: index,
      src: `${performer.data.name} / ${buff.src}`,
    };

    for (const code of recipientCodes) {
      ops.act(code).receiveBuff(meta, effects, event.inputs);
    }

    return recipientCodes;
  }
}
