import type { TargetCalc } from "@/models/TargetCalc";
import type { AttackElement, AttackReaction, LunarType } from "@/types";
import type {
  AbilityBuffEvent,
  AbilityHitEvent,
  CharacterEvent,
  SimulationEvent,
  SwitchInEvent,
} from "../types";
import type { MemberCalc } from "./MemberCalc";

import { talentCalc } from "./talentCalc";
import { Array_ } from "ron-utils";

type BaseHitLog = {
  value: number;
  attElmt: AttackElement | LunarType;
  reaction?: AttackReaction;
};

type CharacterHitLog = BaseHitLog & {
  type: "C";
  performer: number;
};

type EnvironmentHitLog = BaseHitLog & {
  type: "E";
};

type HitLog = CharacterHitLog | EnvironmentHitLog;

export class SimulationProcessor {
  #hitLogs: HitLog[] = [];
  #onFieldMember: number;

  get hitLogs() {
    return this.#hitLogs;
  }

  get onFieldMember(): number {
    return this.#onFieldMember;
  }

  constructor(
    public members: Record<PropertyKey, MemberCalc>,
    public target: TargetCalc,
    onFieldMember: number
  ) {
    this.#onFieldMember = onFieldMember;
  }

  processSwitchInEvent(event: SwitchInEvent) {
    const performer = this.members[event.performer];

    this.#onFieldMember = performer.code;
    // TODO redirect on-field buffs to this member
  }

  processAbilityHitEvent(event: AbilityHitEvent): HitLog {
    const performer = this.members[event.performer];
    const item = performer.data.calcList[event.talent][event.index];

    const calculator = talentCalc(performer, this.target, event.talent);
    const result = calculator.calcAttackItem(item, {
      attElmt: event.attElmt,
      reaction: event.reaction,
    });
    const value = result.values.reduce((acc, value) => acc + Math.round(value.average), 0);

    return {
      type: "C",
      performer: event.performer,
      value,
      attElmt: result.attElmt,
      reaction: event.reaction,
    };
  }

  processAbilityBuffEvent(event: AbilityBuffEvent) {
    const performer = this.members[event.performer];
    const buff = performer.data.buffs?.find((buff) => buff.index === event.modId);

    if (!buff) {
      return;
    }

    const { affect, effects = [] } = buff;

    for (const effect of Array_.toArray(effects)) {
      if (!performer.isPerformableEffect(effect, event.inputs)) {
        continue;
      }

      const bonus = performer.performBonus(effect, {
        inputs: event.inputs,
      });
    }
  }

  processCharacterEvent(event: CharacterEvent) {
    switch (event.type) {
      case "SI": {
        this.processSwitchInEvent(event);
        break;
      }
      case "AH": {
        const log = this.processAbilityHitEvent(event);

        this.#hitLogs = this.#hitLogs.concat(log);
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

  // TODO optimize
  processTimeline(timeline: SimulationEvent[]) {
    this.#hitLogs = [];

    Object.values(this.members).forEach((member) => {
      member.initCalc().allAttrsCtrl.finalize();
    });

    this.target = this.target.clone();

    for (const event of timeline) {
      switch (event.cate) {
        //
        case "C": {
          this.processCharacterEvent(event);
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
}
