import type { AppliedAttackBonus, AppliedAttributeBonus, ModifierAffectType } from "@Backend";
import type {
  HitEvent,
  ModifyEvent,
  SimulationAttributeBonus,
  SimulationEvent,
  SimulationMember,
  SimulationPartyData,
  SimulationTarget,
} from "@Src/types";

import { $AppCharacter } from "@Src/services";
import { pickProps } from "@Src/utils";
import { ConfigTalentHitEventArgs, MemberControl } from "./member-control";

export type SimulationChunk = {
  owner: {
    code: number;
    name: string;
    icon: string;
  };
  events: SimulationEvent[];
};

type OnchangeEvent = (chunks: SimulationChunk[]) => void;

export class SimulationControl {
  partyData: SimulationPartyData;
  target: SimulationTarget;
  member: Record<number, MemberControl>;
  onFieldMember: number;

  private eventIds: number[] = [];
  private chunks: SimulationChunk[] = [];
  private eventSubscribers = new Set<OnchangeEvent>();

  constructor(party: SimulationMember[], target: SimulationTarget) {
    const memberManager: Record<number, MemberControl> = {};
    const partyData = party.map((member) => $AppCharacter.get(member.name));

    for (let i = 0; i < party.length; i++) {
      const member = party[i];
      const memberData = partyData[i];
      memberManager[memberData.code] = new MemberControl(member, partyData[i], partyData);
    }
    this.onFieldMember = partyData[0].code;
    this.member = memberManager;
    this.partyData = partyData;
    this.target = target;
    this.resetTimeline();
  }

  private resetTimeline = () => {
    const firstMember = this.partyData[0];

    this.chunks = [
      {
        owner: pickProps(firstMember, ["code", "name", "icon"]),
        events: [],
      },
    ];
    this.eventIds = [];
  };

  private onChangeEvents = () => {
    this.eventSubscribers.forEach((callback) => callback(this.chunks.concat()));
  };

  subscribeEvents = (callback: OnchangeEvent) => {
    this.eventSubscribers.add(callback);

    const unsubscribe = () => {
      this.eventSubscribers.delete(callback);
    };

    return {
      initialChunks: this.chunks,
      unsubscribe,
    };
  };

  processEvents = (events: SimulationEvent[]) => {
    let isMissmatched = false;
    let checkedIndex = 0;

    while (checkedIndex < this.eventIds.length) {
      const event = events[checkedIndex];

      if (!event || this.eventIds[checkedIndex] !== event.id) {
        isMissmatched = true;
        break;
      }
      checkedIndex++;
    }

    if (isMissmatched) {
      this.resetTimeline();

      for (const code in this.member) {
        this.member[code].reset();
      }

      events.forEach(this.processNewEvent);
      return this.onChangeEvents();
    }

    while (checkedIndex < events.length) {
      this.processNewEvent(events[checkedIndex]);
      checkedIndex++;
    }

    this.onChangeEvents();
  };

  private processNewEvent = (event: SimulationEvent) => {
    switch (event.type) {
      case "MODIFY":
        this.modify(event);
        break;
      case "HIT":
        this.hit(event);
        break;
    }
    this.eventIds.push(event.id);

    if (event.alsoSwitch) {
      // event.performer.type should be 'CHARACTER'
      const member = this.member[event.performer.code];

      if (member) {
        this.chunks.push({
          owner: pickProps(member.data, ["code", "name", "icon"]),
          events: [event],
        });
        return;
      }
    }
    const lastChunk = this.chunks[this.chunks.length - 1];

    if (lastChunk) {
      lastChunk.events.push(event);
      return;
    }

    this.chunks[0] = {
      owner: pickProps(this.partyData[0], ["code", "name", "icon"]),
      events: [event],
    };
  };

  private getReceivers = (performer: MemberControl, affect: ModifierAffectType): MemberControl[] => {
    switch (affect) {
      case "SELF":
        return [performer];
      case "PARTY":
        return this.partyData.map((data) => this.member[data.code]);
      case "ACTIVE_UNIT":
        return [this.member[this.onFieldMember]];
      default:
        return [];
    }
  };

  private updateAttrBonus = (
    receivers: MemberControl[],
    bonus: AppliedAttributeBonus,
    trigger: SimulationAttributeBonus["trigger"]
  ) => {
    receivers.forEach((receiver: MemberControl) => {
      const existedIndex = receiver.attrBonus.findIndex(
        (_bonus) =>
          _bonus.trigger.character === trigger.character &&
          _bonus.trigger.modifier === trigger.modifier &&
          _bonus.toStat === bonus.stat
      );

      if (existedIndex === -1) {
        receiver.attrBonus.push({
          type: "ATTRIBUTE",
          stable: bonus.stable,
          toStat: bonus.stat,
          value: bonus.value,
          trigger,
        });
      } else {
        receiver.attrBonus[existedIndex] = {
          ...receiver.attrBonus[existedIndex],
          value: bonus.value,
        };
      }
    });
  };

  private updateAttkBonus = (
    receivers: MemberControl[],
    bonus: AppliedAttackBonus,
    trigger: SimulationAttributeBonus["trigger"]
  ) => {
    receivers.forEach((receiver: MemberControl) => {
      const existedIndex = receiver.attkBonus.findIndex(
        (_bonus) =>
          _bonus.trigger.character === trigger.character &&
          _bonus.trigger.modifier === trigger.modifier &&
          _bonus.toType === bonus.module &&
          _bonus.toKey === bonus.path
      );

      if (existedIndex === -1) {
        receiver.attkBonus.push({
          type: "ATTACK",
          toType: bonus.module,
          toKey: bonus.path,
          value: bonus.value,
          trigger,
        });
      } else {
        receiver.attkBonus[existedIndex] = {
          ...receiver.attkBonus[existedIndex],
          value: bonus.value,
        };
      }
    });
  };

  private characterModify = (performer: MemberControl, event: ModifyEvent) => {
    const buff = performer?.data.buffs?.find((buff) => buff.index === event.modifier.id);
    if (!buff) return;

    const receivers = this.getReceivers(performer, buff.affect);
    let attrBonusChanged = false;
    let attkBonusChanged = false;

    const trigger = {
      character: performer.data.name,
      modifier: buff.src,
    };

    performer.buffApplier.applyCharacterBuff({
      buff,
      description: "",
      inputs: event.modifier.inputs,
      applyAttrBonus: (bonus) => {
        attrBonusChanged = true;
        this.updateAttrBonus(receivers, bonus, trigger);
      },
      applyAttkBonus: (bonus) => {
        attkBonusChanged = true;
        this.updateAttkBonus(receivers, bonus, trigger);
      },
    });

    if (attrBonusChanged) {
      receivers.forEach((receiver) => {
        receiver.totalAttr.reset();

        for (const bonus of receiver.attrBonus) {
          const add = bonus.stable ? receiver.totalAttr.addStable : receiver.totalAttr.addUnstable;
          add(bonus.toStat, bonus.value, `${bonus.trigger.character} / ${bonus.trigger.modifier}`);
        }
        receiver.onChangeTotalAttr?.(receiver.totalAttr.finalize());
      });
    }
    if (attrBonusChanged || attkBonusChanged) {
      receivers.forEach((receiver) => {
        receiver.onChangeBonuses?.(receiver.attrBonus.concat(), receiver.attkBonus.concat());
      });
    }
  };

  private modify = (event: ModifyEvent) => {
    switch (event.performer.type) {
      case "CHARACTER":
        this.characterModify(this.member[event.performer.code], event);
        break;
    }
  };

  private hit = (event: HitEvent) => {
    switch (event.performer.type) {
      case "CHARACTER": {
        const result = this.member[event.performer.code]?.hit(event, this.partyData, this.target);

        if (result) {
          console.log("hit", result.damage);
          return;
        }
        console.log("not hit");
        return;
      }
    }
  };

  config = (memberCode: number, args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">) => {
    return this.member[memberCode]?.configTalentHitEvent({
      ...args,
      partyData: this.partyData,
      target: this.target,
    });
  };
}
