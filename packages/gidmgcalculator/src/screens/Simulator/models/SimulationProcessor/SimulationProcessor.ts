import { Array_ } from "ron-utils";

import type { TargetCalc } from "@/models";
import type { AttackElement, AttackReaction, LunarType } from "@/types";
import type {
  AbilityBuffEvent,
  AbilityHitEvent,
  MemberEvent,
  SimulationEvent,
  SwitchInEvent,
} from "../../types";
import type { BonusGroupMeta, Member } from "../Member";

import { bonusOperations } from "../../logic/bonusOperations";
import { talentCalc } from "../../logic/talentCalc";
import { Team } from "../Team";
import { categorizeBonusSpecs } from "../../logic/categorizeBonusSpecs";

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
  public target: TargetCalc;

  get hitLogs() {
    return this.#hitLogs;
  }

  constructor(members: Map<number, Member>, target: TargetCalc, onFieldMember: number) {
    const team = new Team(members, onFieldMember);

    this.team = team;
    this.target = target;

    team.init();
    target.finalize();
  }

  private reset() {
    this.#hitLogs = [];
    // TODO optimize by replace
    this.team.init();
  }

  // TODO optimize
  runTimeline(timeline: SimulationEvent[]) {
    this.reset();

    for (const event of timeline) {
      switch (event.cate) {
        case "M": {
          this.runMemberEvent(event);
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

  runMemberEvent(event: MemberEvent) {
    switch (event.type) {
      case "SI": {
        this.runSwitchInEvent(event);
        break;
      }
      case "AH": {
        const log = this.runAbilityHitEvent(event);

        this.#hitLogs.push(log);
        break;
      }
      case "RH": {
        // TODO process reaction hit event
        break;
      }
      case "AB": {
        this.runAbilityBuffEvent(event);
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

  runSwitchInEvent(event: SwitchInEvent) {
    const performer = this.team.getMember(event.performer);

    this.team.setOnFieldMember(performer);
    // TODO redirect on-field buffs to this member
  }

  // ## Ability Hit Event

  runAbilityHitEvent(event: AbilityHitEvent): HitLog {
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

  runAbilityBuffEvent(event: AbilityBuffEvent) {
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
      affect: buff.affect,
    };

    const bonusOps = bonusOperations(performer, this.team, { inputs: event.inputs });

    const specCates = categorizeBonusSpecs(Array_.toArray(effects), performerOps.can);

    if (!specCates) {
      console.info(`No available effects: ${performer.data.name} / ${buff.src}`);
      return;
    }

    bonusOps.applyBonusSpecs(meta, specCates.rearrange());

    for (const recipient of bonusOps.recipients) {
      recipient.finalizeAttrs();
    }
  }
}
