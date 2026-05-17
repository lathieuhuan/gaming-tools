import type { TargetCalc } from "@/models";
import type { AttackElement, AttackReaction, LunarType } from "@/types";
import type {
  DbSimulationEvent,
  RawAbilityHitEvent,
  RawArtifactBuffEvent,
  RawMemberEvent,
  RawModifyEvent,
  RawSwitchInEvent,
  RawTeamBuffEvent,
  RawTeamEvent,
  SimulationEvent,
} from "../../types";
import type { BonusGroupMeta, Member } from "../Member";

import { $AppData } from "@/services";
import { EEventCategory, EHitEventType, EModifyEventType } from "../../configs";
import { talentCalc } from "../../logic/talentCalc";
import { Team } from "../Team";
import { applyMemberBuff } from "./applyMemberBuff";

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
  timeline: SimulationEvent[] = [];
  hitLogs: HitLog[] = [];

  public team: Team;
  public target: TargetCalc;

  constructor(members: Map<number, Member>, target: TargetCalc, onFieldMember: number) {
    const team = new Team(members, onFieldMember);

    this.team = team;
    this.target = target;

    team.init();
    target.finalize();
  }

  private reset() {
    this.hitLogs = [];
    this.timeline = [];
    // TODO optimize by replace
    this.team.init();
  }

  // TODO check if enhance needed
  private timelineSynced(timeline: DbSimulationEvent[]) {
    return this.timeline.every((event, index) => event.id === timeline[index].id);
  }

  runTimeline(timeline: DbSimulationEvent[]) {
    if (this.timelineSynced(timeline)) {
      const eventCount = timeline.length;

      for (let i = this.timeline.length; i < eventCount; i++) {
        this.runEvent(timeline[i]);
      }

      this.hitLogs = [...this.hitLogs];
      this.timeline = [...this.timeline];
    } else {
      this.reset();

      for (const event of timeline) {
        this.runEvent(event);
      }
    }

    this.team.memberList.forEach((member) => {
      this.team.setMember(member.clone());
    });
  }

  runEvent(event: DbSimulationEvent) {
    switch (event.cate) {
      case EEventCategory.MEMBER: {
        this.runMemberEvent(event);
        break;
      }
      case EEventCategory.TEAM: {
        // TODO process team event
        break;
      }
      case EEventCategory.ENVIRONMENT: {
        // TODO process environment event
        break;
      }
      default:
        event satisfies never;
    }
  }

  // # Member Event
  runMemberEvent(event: RawMemberEvent) {
    switch (event.type) {
      case "SI": {
        this.runSwitchInEvent(event);
        break;
      }
      case EHitEventType.ABILITY_HIT: {
        this.runAbilityHitEvent(event);
        break;
      }
      case EHitEventType.REACTION_HIT: {
        // TODO process reaction hit event
        break;
      }
      case EModifyEventType.ABILITY_BUFF: {
        this.runAbilityBuffEvent(event);
        break;
      }
      case EModifyEventType.WEAPON_BUFF: {
        this.runWeaponBuffEvent(event);
        break;
      }
      case EModifyEventType.ARTIFACT_SET_BUFF: {
        this.runArtifactSetBuffEvent(event);
        break;
      }
      default:
        event satisfies never;
    }
  }

  // ## Switch In Event
  runSwitchInEvent(event: RawSwitchInEvent) {
    const performer = this.team.getMember(event.performer);

    this.team.setOnFieldMember(performer);

    this.timeline.push({
      ...event,
      type: "SI",
      performer: performer.data,
    });
    // TODO redirect on-field buffs to this member
  }

  // ## Ability Hit Event
  runAbilityHitEvent(event: RawAbilityHitEvent) {
    const performer = this.team.getMember(event.performer);
    const item = performer.data.calcList[event.talent][event.index];

    if (item.type && item.type !== "attack") {
      this.timeline.push({
        id: event.id,
        cate: EEventCategory.ERROR,
        message: `Event is not an attack event: ${event.talent} / ${event.index}`,
      });
      return;
    }

    const calculator = talentCalc(performer, this.target, event.talent);
    const result = calculator.attackCalc(item).calculate({
      attElmt: event.forcedElmt,
      reaction: event.reaction,
    });

    let value = result.values.reduce((acc, value) => acc + value, 0);
    value = Math.round(event.isCrit ? value * (1 + result.cDmg) : value);

    this.hitLogs.push({
      type: EHitLogType.MEMBER,
      performer: event.performer,
      value,
      attElmt: result.attElmt,
      reaction: event.reaction,
    });

    this.timeline.push({
      ...event,
      type: EHitEventType.ABILITY_HIT,
      performer: performer.data,
      spec: item,
    });
  }

  // ## Ability Buff Event
  runAbilityBuffEvent(event: RawModifyEvent) {
    const { team } = this;
    const performer = team.getMember(event.performer);
    const performerOps = team.getMemberOps(performer);
    const { data } = performer;
    const buff = data.buffs?.find((buff) => buff.id === event.modId);

    if (!buff) {
      this.timeline.push({
        id: event.id,
        cate: EEventCategory.ERROR,
        message: `Buff not found: ${data.name} / ${event.modId}`,
      });
      return;
    }

    if (!performerOps.can.performEffect(buff, event.inputs)) {
      this.timeline.push({
        id: event.id,
        cate: EEventCategory.ERROR,
        message: `Buff not valid: ${data.name} / ${buff.src}`,
      });
      return;
    }

    const meta: BonusGroupMeta = {
      id: `c${data.code}-${buff.id}`,
      src: `${data.name} / ${buff.src}`,
      affect: buff.affect,
    };

    const applied = applyMemberBuff(meta, buff.effects, performerOps, { inputs: event.inputs });

    if (applied) {
      team.finalizeMembers();
    }

    this.timeline.push({
      ...event,
      type: EModifyEventType.ABILITY_BUFF,
      performer: data,
      buff,
      inputs: event.inputs,
    });
  }

  // ## Weapon Buff Event
  runWeaponBuffEvent(event: RawModifyEvent) {
    const { team } = this;
    const performer = team.getMember(event.performer);
    const performerOps = team.getMemberOps(performer);
    const item = performer.weapon.data;
    const buff = item.buffs?.find((buff) => buff.id === event.modId);

    if (!buff) {
      this.timeline.push({
        id: event.id,
        cate: EEventCategory.ERROR,
        message: `Buff not found: ${performer.data.name} / ${event.modId}`,
      });
      return;
    }

    const { data } = performer;
    const { refi } = performer.weapon;

    const meta: BonusGroupMeta = {
      id: `c${data.code}-w${item.code}-${buff.id}`,
      src: `${item.name} R${refi} (${data.name})`,
      affect: buff.affect,
    };

    const applied = applyMemberBuff(meta, buff.effects, performerOps, {
      inputs: event.inputs,
      refi,
    });

    if (applied) {
      team.finalizeMembers();
    }

    this.timeline.push({
      ...event,
      type: EModifyEventType.WEAPON_BUFF,
      performer: data,
      item,
      buff,
    });
  }

  // ## Artifact Set Buff Event
  runArtifactSetBuffEvent(event: RawArtifactBuffEvent) {
    const { team } = this;
    const performer = team.getMember(event.performer);
    const performerOps = team.getMemberOps(performer);
    const set = performer.atfGear.sets.find((set) => set.data.code === event.itemId);
    const buff = set?.data.buffs?.find((buff) => buff.id === event.modId);

    if (!buff || !set) {
      this.timeline.push({
        id: event.id,
        cate: EEventCategory.ERROR,
        message: `Buff not found: ${performer.data.name} / ${event.modId}`,
      });
      return;
    }

    const { data } = performer;
    const item = set.data;

    const meta: BonusGroupMeta = {
      id: `c${data.code}-a${item.code}-${buff.id}`,
      src: `${item.name} (${data.name})`,
      affect: buff.affect,
    };

    const applied = applyMemberBuff(meta, buff.effects, performerOps, {
      inputs: event.inputs,
    });

    if (applied) {
      team.finalizeMembers();
    }

    this.timeline.push({
      ...event,
      type: EModifyEventType.ARTIFACT_SET_BUFF,
      performer: data,
      item,
      buff,
    });
  }

  // # Team Event
  runTeamEvent(event: RawTeamEvent) {
    switch (event.type) {
      case EModifyEventType.TEAM_BUFF: {
        this.runTeamBuffEvent(event);
        break;
      }
      case EHitEventType.TEAM_HIT: {
        // TODO process team hit event
        break;
      }
      default:
        event satisfies never;
    }
  }

  // ## Team Buff Event
  runTeamBuffEvent(event: RawTeamBuffEvent) {
    const { team } = this;
    const buff = $AppData.teamBuffs.find((buff) => buff.id === event.modId);

    if (!buff) {
      this.timeline.push({
        id: event.id,
        cate: EEventCategory.ERROR,
        message: `Team buff not found: ${event.modId}`,
      });
      return;
    }

    if (!team.state.isAvailableEffect(buff)) {
      this.timeline.push({
        id: event.id,
        cate: EEventCategory.ERROR,
        message: `Team buff not valid: ${buff.src}`,
      });
      return;
    }

    // TODO apply team buff
  }
}
