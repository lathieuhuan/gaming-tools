import type { AppliedAttackBonus, AppliedAttributeBonus, AttackElement, ModifierAffectType } from "@Backend";
import type {
  AttackReaction,
  HitEvent,
  ModifyEvent,
  SimulationAttributeBonus,
  SimulationEvent,
  SimulationMember,
  SimulationPartyData,
  SimulationTarget,
} from "@Src/types";

import { $AppCharacter } from "@Src/services";
import { toArray, uuid } from "@Src/utils";
import { ConfigTalentHitEventArgs, MemberControl } from "./member-control";

type SimulationProcessedBaseEvent = {
  description: string;
  error?: string;
};

type ProcessedHitEvent = HitEvent &
  SimulationProcessedBaseEvent & {
    damage: {
      value: number;
      element: AttackElement;
    };
    reaction: AttackReaction;
  };

type ProcessedModifyEvent = ModifyEvent & SimulationProcessedBaseEvent & {};

export type SimulationProcessedEvent = ProcessedModifyEvent | ProcessedHitEvent;

export type SimulationChunk = {
  id: string;
  ownerCode: number;
  events: SimulationProcessedEvent[];
};

export type SimulationChunksSumary = {
  damage: number;
  duration: number;
};

type OnchangeEvent = (chunks: SimulationChunk[], sumary: SimulationChunksSumary) => void;

export class SimulationControl {
  partyData: SimulationPartyData;
  target: SimulationTarget;
  member: Record<number, MemberControl>;

  private eventIds: number[] = [];
  private chunks: SimulationChunk[] = [];
  private sumary: SimulationChunksSumary = {
    damage: 0,
    duration: 0,
  };
  private eventSubscribers = new Set<OnchangeEvent>();

  constructor(party: SimulationMember[], target: SimulationTarget) {
    const memberManager: Record<number, MemberControl> = {};
    const partyData = party.map((member) => $AppCharacter.get(member.name));

    for (let i = 0; i < party.length; i++) {
      const member = party[i];
      const memberData = partyData[i];
      memberManager[memberData.code] = new MemberControl(member, partyData[i], partyData);
    }
    this.member = memberManager;
    this.partyData = partyData;
    this.target = target;
    this.resetTimeline();
  }

  getLastestChunk = () => {
    const lastestChunk = this.chunks[0];

    if (!lastestChunk) {
      this.chunks[0] = {
        id: uuid(),
        ownerCode: this.partyData[0].code,
        events: [],
      };
      return this.chunks[0];
    }
    return lastestChunk;
  };

  getMemberData = (code: number) => {
    return this.member[code].data;
  };

  switchMember = (code: number) => {
    this.addEvent([], code);
    this.onChangeEvents();
  };

  private resetTimeline = () => {
    this.chunks = [
      {
        id: uuid(),
        ownerCode: this.partyData[0].code,
        events: [],
      },
    ];
    this.eventIds = [];
  };

  // ========== EVENTS ==========

  private onChangeEvents = () => {
    this.eventSubscribers.forEach((callback) => callback(this.chunks.concat(), this.sumary));
  };

  subscribeEvents = (callback: OnchangeEvent) => {
    this.eventSubscribers.add(callback);

    const unsubscribe = () => {
      this.eventSubscribers.delete(callback);
    };

    return {
      initialChunks: this.chunks,
      initialSumary: this.sumary,
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
    let processedEvent: SimulationProcessedEvent;

    switch (event.type) {
      case "MODIFY":
        processedEvent = this.modify(event);
        break;
      case "HIT":
        processedEvent = this.hit(event);
        break;
    }

    this.addEvent(processedEvent, event.alsoSwitch ? event.performer.code : undefined);
    this.eventIds.push(event.id);
  };

  private addEvent = (event: SimulationProcessedEvent | SimulationProcessedEvent[], ownerCode?: number) => {
    const lastestChunk = this.getLastestChunk();

    if (!ownerCode) {
      lastestChunk.events.unshift(...toArray(event));
      return;
    }
    if (!lastestChunk.events.length) {
      this.chunks.shift();
    }
    if (ownerCode === this.chunks[0]?.ownerCode) {
      lastestChunk.events.unshift(...toArray(event));
      return;
    }
    this.chunks.unshift({
      id: uuid(),
      ownerCode,
      events: toArray(event),
    });
  };

  // ========== MODIFY ==========

  private getReceivers = (performer: MemberControl, affect: ModifierAffectType): MemberControl[] => {
    switch (affect) {
      case "SELF":
        return [performer];
      case "PARTY":
        return this.partyData.map((data) => this.member[data.code]);
      case "ACTIVE_UNIT": {
        const onFieldMember = this.getLastestChunk().ownerCode;
        return [this.member[onFieldMember]];
      }
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

  /** Return null if buff not found, otherwise return buff.src */
  private characterModify = (performer: MemberControl, event: ModifyEvent) => {
    const { id, inputs = [] } = event.modifier;
    const buff = performer?.data.buffs?.find((buff) => buff.index === id);
    if (!buff) return null;

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
      inputs,
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

    return buff.src;
  };

  private modify = (event: ModifyEvent): ProcessedModifyEvent => {
    let description: string;
    let error: string | undefined;

    switch (event.performer.type) {
      case "CHARACTER": {
        // #to-do: check if character can do this event (in case events are imported
        // but the modifier is not granted because of character's level/constellation)
        const src = this.characterModify(this.member[event.performer.code], event);

        if (src) {
          description = src;
        } else {
          error = "Cannot find the modifier.";
          description = `[${error}]`;
        }
        break;
      }
    }
    return {
      ...event,
      description,
      error,
    };
  };

  // ========== HIT ==========

  private hit = (event: HitEvent): ProcessedHitEvent => {
    switch (event.performer.type) {
      case "CHARACTER": {
        const result = this.member[event.performer.code]?.hit(event, this.partyData, this.target);
        const damage: ProcessedHitEvent["damage"] = {
          value: 0,
          element: "phys",
        };
        let description: string;
        let error: string | undefined;
        let reaction: AttackReaction = null;

        if (result) {
          damage.value = result.damage;
          damage.element = result.attElmt;
          reaction = result.reaction;
          description = result.name;

          if (result.disabled) {
            error = "This attack is disabled.";
          }
        } else {
          error = "Cannot find the attack.";
          description = `[${error}]`;
        }

        this.sumary.damage += damage.value;
        this.sumary.duration += event.duration ?? 0;

        return {
          ...event,
          damage,
          reaction,
          description,
        };
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
