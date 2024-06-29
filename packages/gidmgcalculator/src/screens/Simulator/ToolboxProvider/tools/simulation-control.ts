import type { AppWeapon, AppliedAttackBonus, AppliedAttributeBonus, ModifierAffectType } from "@Backend";
import type {
  AttackReaction,
  HitEvent,
  ModifyEvent,
  SimulationAttributeBonus,
  SimulationChunk,
  SimulationEvent,
  SimulationMember,
  SimulationPartyData,
  SimulationTarget,
} from "@Src/types";
import type {
  ProcessedHitEvent,
  ProcessedModifyEvent,
  SimulationChunksSumary,
  SimulationProcessedChunk,
  SimulationProcessedEvent,
} from "../ToolboxProvider.types";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import { ConfigTalentHitEventArgs, MemberControl } from "./member-control";

type MissmatchedCheckResult =
  | {
      isMissmatched: true;
    }
  | {
      isMissmatched: false;
      nextChunkIndex: number;
      nextEventIndex: number;
    };

type OnChangeChunk = (chunks: SimulationProcessedChunk[], sumary: SimulationChunksSumary) => void;

export class SimulationControl {
  partyData: SimulationPartyData = [];
  appWeapons: Record<number, AppWeapon> = {};
  target: SimulationTarget;
  member: Record<number, MemberControl> = {};

  private chunks: SimulationProcessedChunk[] = [];
  private sumary: SimulationChunksSumary = {
    damage: 0,
    duration: 0,
  };
  private chunkSubscribers = new Set<OnChangeChunk>();

  constructor(party: SimulationMember[], target: SimulationTarget) {
    this.partyData = party.map((member) => $AppCharacter.get(member.name));
    this.target = target;

    for (let i = 0; i < party.length; i++) {
      const member = party[i];
      const memberData = this.partyData[i];
      const weaponCode = member.weapon.code;

      if (!this.appWeapons[weaponCode]) {
        this.appWeapons[weaponCode] = $AppWeapon.get(weaponCode)!;
      }

      this.member[memberData.code] = new MemberControl(
        member,
        this.partyData[i],
        this.appWeapons[weaponCode],
        this.partyData
      );
    }
  }

  getMemberData = (code: number) => {
    return this.member[code].data;
  };

  getMemberInfo = (code: number) => {
    return this.member[code].info;
  };

  getAppWeaponOfMember = (code: number) => {
    return this.appWeapons[this.member[code].info.weapon.code];
  };

  // ========== EVENTS ==========

  private onChangeEvents = () => {
    // console.log("onChangeEvents");
    // console.log(this.chunks);

    this.chunkSubscribers.forEach((callback) => callback(this.chunks.concat(), this.sumary));
  };

  subscribeChunks = (callback: OnChangeChunk) => {
    this.chunkSubscribers.add(callback);

    const unsubscribe = () => {
      this.chunkSubscribers.delete(callback);
    };

    return {
      initialChunks: this.chunks,
      initialSumary: this.sumary,
      unsubscribe,
    };
  };

  private checkMissmatched = (chunks: SimulationChunk[]): MissmatchedCheckResult => {
    // console.log("checkMissmatched");
    // console.log(structuredClone(chunks));
    // console.log(structuredClone(this.chunks));

    if (!this.chunks.length) {
      // at the start
      return {
        isMissmatched: true,
      };
    }
    if (!this.chunks[this.chunks.length - 1].events.length) {
      this.chunks.pop();
    }
    if (this.chunks.length > chunks.length) {
      return {
        isMissmatched: true,
      };
    }

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const thisChunk = this.chunks[chunkIndex];

      if (!thisChunk) {
        // thisChunks are less than chunks
        return {
          isMissmatched: false,
          nextChunkIndex: chunkIndex,
          nextEventIndex: 0,
        };
      }
      const chunk = chunks[chunkIndex];

      if (thisChunk.id !== chunk.id || thisChunk.events.length > chunk.events.length) {
        return {
          isMissmatched: true,
        };
      }

      for (let eventIndex = 0; eventIndex < chunk.events.length; eventIndex++) {
        const thisEvent = thisChunk.events[eventIndex];

        if (!thisEvent) {
          // thisEvents are less than events
          return {
            isMissmatched: false,
            nextChunkIndex: chunkIndex,
            nextEventIndex: eventIndex,
          };
        }
        const event = chunk.events[eventIndex];

        if (thisEvent.id !== event.id) {
          return {
            isMissmatched: true,
          };
        }
      }
    }

    return {
      isMissmatched: false,
      nextChunkIndex: chunks.length,
      nextEventIndex: 0,
    };
  };

  processChunks = (chunks: SimulationChunk[]) => {
    if (!chunks.length) {
      console.error("No chunks found");
      return;
    }
    const result = this.checkMissmatched(chunks);

    // console.log({ ...result });

    if (result.isMissmatched) {
      // Reset
      this.chunks = [];
      this.sumary = {
        damage: 0,
        duration: 0,
      };

      for (const chunk of chunks) {
        if (chunk.events.length) {
          chunk.events.forEach((event) => this.processNewEvent(event, chunk));
        } else {
          this.chunks.push({
            ...chunk,
            events: [],
          });
        }
      }
    } else {
      for (let chunkIndex = result.nextChunkIndex; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];

        if (chunk.events.length) {
          const startEventIndex = chunkIndex === result.nextChunkIndex ? result.nextEventIndex : 0;

          for (let eventIndex = startEventIndex; eventIndex < chunk.events.length; eventIndex++) {
            this.processNewEvent(chunk.events[eventIndex], chunk);
          }
        }
        // Switch character, empty chunk.
        else {
          this.chunks.push({
            ...chunk,
            events: [],
          });
        }
      }
    }
    this.onChangeEvents();
  };

  private processNewEvent = (event: SimulationEvent, chunk: SimulationChunk) => {
    let processedEvent: SimulationProcessedEvent;

    switch (event.type) {
      case "MODIFY":
        processedEvent = this.modify(event);
        break;
      case "HIT":
        processedEvent = this.hit(event);
        break;
    }
    const latestChunk = this.chunks[this.chunks.length - 1];

    if (latestChunk && chunk.id === latestChunk.id) {
      latestChunk.events.push(processedEvent);
    } else {
      this.chunks.push({
        ...chunk,
        events: [processedEvent],
      });
    }
  };

  // ========== MODIFY ==========

  private getReceivers = (performer: MemberControl, affect: ModifierAffectType): MemberControl[] => {
    switch (affect) {
      case "SELF":
        return [performer];
      case "PARTY":
        return this.partyData.map((data) => this.member[data.code]);
      case "ACTIVE_UNIT": {
        const onFieldMember = this.chunks[0].ownerCode;
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
