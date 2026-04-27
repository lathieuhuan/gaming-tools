import { Array_ } from "ron-utils";

import type { TargetCalc } from "@/models";
import type {
  AttackElement,
  AttackReaction,
  AttributeBonus,
  AttributeTargetPath,
  BareBonus,
  BonusSpec,
  LunarType,
} from "@/types";
import type {
  AbilityBuffEvent,
  AbilityHitEvent,
  MemberEvent,
  SimulationEvent,
  SwitchInEvent,
} from "../types";

import { ELEMENT_TYPES, PHEC_ELEMENT_TYPES } from "@/constants";
import { Member } from "@/models/Member";
import { talentCalc } from "../logic/talentCalc";
import { Team } from "./Team";
import { BonusCalc } from "./Team/BonusCalc";

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

  private processToStat(
    path: AttributeTargetPath,
    receiver: Member,
    inputs: number[],
    inpIndex: number
  ): AttributeBonus["toStat"] | undefined {
    switch (path) {
      case "INP_ELMT": {
        const elmtIndex = inputs[inpIndex] ?? 0;
        return ELEMENT_TYPES[elmtIndex];
      }
      case "OWN_ELMT": {
        return receiver.data.vision;
      }
      case "P/H/E/C": {
        return PHEC_ELEMENT_TYPES.find((elmt) => this.team.state.elmtCount.has(elmt));
      }
      default:
        return path;
    }
  }

  deliverBonus(
    receiverCode: number,
    bonus: BareBonus,
    spec: BonusSpec,
    inputs: number[] = []
  ): boolean {
    const { ops } = this.team;
    const receiver = this.team.getMember(receiverCode);

    if (!ops.can(receiverCode).receiveEffect(spec)) {
      return false;
    }

    if (spec.outsource) {
      const stacksSpec = spec.outsource.stacks;
      const stacks = new BonusCalc(receiver, this.team, { inputs }).getStacks(stacksSpec);

      bonus.value *= stacks?.value ?? 1;
    }

    for (const target of Array_.toArray(spec.targets)) {
      switch (target.module) {
        case "ATTR": {
          for (const targetPath of Array_.toArray(target.path)) {
            const toStat = this.processToStat(targetPath, receiver, inputs, target.inpIndex ?? 0);
            if (!toStat) continue;

            receiver.receiveAttrBonus({
              ...bonus,
              toStat,
              label: "",
              effectSrc: spec,
            });
          }
          break;
        }
        case "TLT": {
          for (const targetPath of Array_.toArray(target.path)) {
            if (!spec.id) continue;

            receiver.lvBonusCtrl.set(spec.id, {
              id: spec.id,
              toType: targetPath,
              value: bonus.value,
              label: "",
            });
          }
          break;
        }
        default:
          for (const module of Array_.toArray(target.module)) {
            receiver.receiveAttkBonus({
              toType: module,
              toKey: target.path,
              value: bonus.value,
              label: "",
              effectSrc: spec,
            });
          }
      }
    }

    return true;
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

    const changedCodes: number[] = [];
    const { affect, effects = [] } = buff;

    for (const spec of Array_.toArray(effects)) {
      if (!can.performEffect(spec, event.inputs)) {
        continue;
      }

      const bonus = act.performBonus(spec, { inputs: event.inputs });

      if (!bonus.value) {
        continue;
      }

      switch (affect) {
        case "SELF": {
          this.deliverBonus(performer.code, bonus, spec, event.inputs);
          changedCodes.push(performer.code);
          break;
        }
        case "TEAMMATE": {
          team.members.forEach((member) => {
            if (member.code === performer.code) return;

            this.deliverBonus(member.code, bonus, spec, event.inputs);
            changedCodes.push(member.code);
          });
          break;
        }
        case "SELF_TEAMMATE": {
          break;
        }
        case "PARTY": {
          team.members.forEach((member) => {
            this.deliverBonus(member.code, bonus, spec, event.inputs);
            changedCodes.push(member.code);
          });
          break;
        }
        case "ONE_UNIT": {
          break;
        }
        case "ACTIVE_UNIT": {
          this.deliverBonus(this.#onFieldCode, bonus, spec, event.inputs);
          changedCodes.push(this.#onFieldCode);
          break;
        }
        default:
          affect satisfies never;
      }
    }

    for (const code of changedCodes) {
      team.setMember(team.getMember(code).clone());
    }
  }
}
