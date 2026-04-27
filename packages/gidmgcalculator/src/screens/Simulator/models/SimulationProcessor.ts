import type { TargetCalc } from "@/models";
import type { AttackElement, AttackReaction, LunarType } from "@/types";
import type {
  AbilityBuffEvent,
  AbilityHitEvent,
  MemberEvent,
  SimulationEvent,
  SwitchInEvent,
} from "../types";

import { Member } from "@/models/Member";
import { Array_ } from "ron-utils";
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
  processTimeline(timeline: SimulationEvent[]) {
    this.#hitLogs = [];
    this.team.prepare();
    this.target = this.target.clone();

    for (const event of timeline) {
      switch (event.cate) {
        //
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
  }

  // ===== Member Event =====

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

  processSwitchInEvent(event: SwitchInEvent) {
    const performer = this.team.getMember(event.performer);

    this.#onFieldCode = performer.code;
    // TODO redirect on-field buffs to this member
  }

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

  processAbilityBuffEvent(event: AbilityBuffEvent) {
    const { team } = this;
    const performer = team.getMember(event.performer);
    const can = team.ops.can(performer.code);
    const act = team.ops.act(performer.code);
    const buff = performer.data.buffs?.find((buff) => buff.index === event.modId);

    if (!buff) {
      // TODO handle error not found
      return;
    }

    if (!can.performEffect(buff, event.inputs)) {
      // TODO handle error not valid
      return;
    }

    const { affect, effects = [] } = buff;

    for (const spec of Array_.toArray(effects)) {
      if (!can.performEffect(spec, event.inputs)) {
        continue;
      }

      const bonus = act.performBonus(spec, {
        inputs: event.inputs,
      });
    }
  }
}
