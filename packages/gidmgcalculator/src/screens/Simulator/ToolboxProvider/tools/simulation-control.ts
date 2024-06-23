import type { AppliedAttackBonus, AppliedAttributeBonus, ModifierAffectType } from "@Backend";
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

import { $AppCharacter } from "@Src/services";
import { toArray, uuid } from "@Src/utils";
import { ConfigTalentHitEventArgs, MemberControl } from "./member-control";

type MissmatchedCheckResult =
  | {
      isMissmatched: true;
    }
  | {
      isMissmatched: false;
      checkedChunkIndex: number;
      checkedEventIndex: number;
    };

type OnChangeChunk = (chunks: SimulationProcessedChunk[], sumary: SimulationChunksSumary) => void;

export class SimulationControl {
  partyData: SimulationPartyData;
  target: SimulationTarget;
  member: Record<number, MemberControl>;

  // private chunkRecords: ChunkRecords = [];
  private chunks: SimulationProcessedChunk[] = [];
  private sumary: SimulationChunksSumary = {
    damage: 0,
    duration: 0,
  };
  private chunkSubscribers = new Set<OnChangeChunk>();

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
  }

  getMemberData = (code: number) => {
    return this.member[code].data;
  };

  // ========== EVENTS ==========

  private onChangeEvents = () => {
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

  private checkMismatched = (chunks: SimulationChunk[]): MissmatchedCheckResult => {
    // console.log("checkMismatched");
    // console.log([...chunks]);
    // console.log([...this.chunks]);

    if (!this.chunks.length || this.chunks.length > chunks.length) {
      return {
        isMissmatched: true,
      };
    }

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const thisChunk = this.chunks[chunkIndex];

      if (!thisChunk) {
        // thisChunk are less than chunks
        return {
          isMissmatched: false,
          checkedChunkIndex: chunkIndex,
          checkedEventIndex: 0,
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
            checkedChunkIndex: chunkIndex,
            checkedEventIndex: eventIndex,
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

    const checkedChunkIndex = chunks.length - 1;

    return {
      isMissmatched: false,
      checkedChunkIndex,
      checkedEventIndex: chunks[checkedChunkIndex].events.length - 1,
    };
  };

  processChunks = (chunks: SimulationChunk[]) => {
    const result = this.checkMismatched(chunks);

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
      for (let chunkIndex = result.checkedChunkIndex; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];

        if (chunk.events.length) {
          const startEventIndex = chunkIndex === result.checkedChunkIndex ? result.checkedEventIndex : 0;

          for (let eventIndex = startEventIndex; eventIndex < chunk.events.length; eventIndex++) {
            this.processNewEvent(chunk.events[eventIndex], chunk);
          }
        } else {
          // Switch character, empty chunk
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
    const lastestChunk = this.chunks[this.chunks.length - 1];

    if (lastestChunk && chunk.id === lastestChunk.id) {
      lastestChunk.events.push(processedEvent);
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
