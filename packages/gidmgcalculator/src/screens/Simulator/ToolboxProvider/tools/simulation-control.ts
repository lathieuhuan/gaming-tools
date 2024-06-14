import type { AppliedAttackBonus, AppliedAttributeBonus } from "@Backend";
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
import { toArray } from "@Src/utils";
import { ConfigTalentHitEventArgs, MemberControl } from "./member-control";

type SimulationPolishedEvent = {
  performer: {
    name: string;
    icon: string;
  };
};

type OnchangeEvent = (events: SimulationPolishedEvent[]) => void;

export class SimulationControl {
  partyData: SimulationPartyData;
  target: SimulationTarget;
  member: Record<number, MemberControl>;
  onFieldMember: number;

  private events: SimulationEvent[] = [];
  private polishedEvents: SimulationPolishedEvent[] = [];
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
  }

  private onChangeEvents = () => {
    this.eventSubscribers.forEach((callback) => callback(this.polishedEvents));
  };

  processEvents = (events: SimulationEvent[]) => {
    let isMissmatched = false;
    let checkedIndex = 0;

    while (checkedIndex < this.events.length) {
      const event = events[checkedIndex];

      if (!event || this.events[checkedIndex].id !== event.id) {
        isMissmatched = true;
        break;
      }
      checkedIndex++;
    }

    if (isMissmatched) {
      this.events = [];

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
        this.hit({ ...event, isOnField: true, duration: 1 });
        break;
    }
    this.events.push(event);

    // this.polishedEvents.push({});
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

  private modify = (event: ModifyEvent) => {
    const performer = this.member[event.performer];
    const receivers = toArray(event.receiver).map((code) => this.member[code]);
    const buff = performer?.data.buffs?.find((buff) => buff.index === event.modifier.id);

    if (buff) {
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
          receiver.onChangeBonuses?.(structuredClone(receiver.attrBonus), structuredClone(receiver.attkBonus));
        });
      }
    }
  };

  private hit = (event: HitEvent) => {
    const result = this.member[event.performer]?.hit(event, this.partyData, this.target);

    if (result) {
      console.log("hit", result.damage);
      return;
    }
    console.log("not hit");
  };

  config = (memberCode: number, args: Omit<ConfigTalentHitEventArgs, "partyData" | "target">) => {
    return this.member[memberCode]?.configTalentHitEvent({
      ...args,
      partyData: this.partyData,
      target: this.target,
    });
  };
}
