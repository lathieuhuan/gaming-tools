import type { CharacterCalc } from "@/models/CharacterCalc";
import type { TargetCalc } from "@/models/TargetCalc";
import type { AttackElement, AttackReaction, LunarType } from "@/types";
import type { CharacterEvent, SimulationEvent, SwitchInEvent, TalentHitEvent } from "../types";

import { talentCalc } from "./talentCalc";

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
    public members: Record<PropertyKey, CharacterCalc>,
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

  processTalentHitEvent(event: TalentHitEvent): HitLog {
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

  processCharacterEvent(event: CharacterEvent) {
    switch (event.type) {
      case "SI": {
        this.processSwitchInEvent(event);
        break;
      }

      case "TH": {
        const log = this.processTalentHitEvent(event);

        this.#hitLogs = this.#hitLogs.concat(log);
        break;
      }

      case "RH": {
        // TODO process reaction hit event
        break;
      }

      case "M": {
        // TODO process modify event
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
