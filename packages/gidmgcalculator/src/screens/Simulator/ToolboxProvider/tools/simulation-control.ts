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
import { ApplyBonusArgs } from "@Src/backend/appliers/appliers.types";

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

  private onChangeEvents = (receivers: Set<MemberControl> | MemberControl[]) => {
    console.log("onChangeEvents");
    // console.log(this.chunks);
    console.log(receivers);

    receivers.forEach((receiver) => {
      receiver.totalAttr.reset();

      for (const bonus of receiver.attrBonus) {
        const add = bonus.stable ? receiver.totalAttr.addStable : receiver.totalAttr.addUnstable;
        add(bonus.toStat, bonus.value, `${bonus.trigger.character} / ${bonus.trigger.modifier}`);
      }
      receiver.onChangeTotalAttr?.(receiver.totalAttr.finalize());
    });

    receivers.forEach((receiver) => {
      receiver.onChangeBonuses?.(receiver.attrBonus.concat(), receiver.attkBonus.concat());
    });

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
      return this.onChangeEvents(this.partyData.map((data) => this.member[data.code]));
    }
    let allReceivers: MemberControl[] = [];

    for (let chunkIndex = result.nextChunkIndex; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];

      if (chunk.events.length) {
        const startEventIndex = chunkIndex === result.nextChunkIndex ? result.nextEventIndex : 0;

        for (let eventIndex = startEventIndex; eventIndex < chunk.events.length; eventIndex++) {
          const receivers = this.processNewEvent(chunk.events[eventIndex], chunk);
          allReceivers = allReceivers.concat(receivers);
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
    console.log('processChunks');
    console.log(allReceivers);

    this.onChangeEvents(new Set(allReceivers));
  };

  private processNewEvent = (event: SimulationEvent, chunk: SimulationChunk) => {
    let processedEvent: SimulationProcessedEvent;
    let receivers: MemberControl[] = [];

    switch (event.type) {
      case "MODIFY":
        [processedEvent, receivers] = this.modify(event);
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

    return receivers;
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

  private baseModify = (
    performer: MemberControl,
    affect: ModifierAffectType,
    modifier: string,
    apply: (applyFn: Pick<ApplyBonusArgs, "applyAttrBonus" | "applyAttkBonus">) => void
  ) => {
    const receivers = this.getReceivers(performer, affect);
    const trigger: SimulationAttributeBonus["trigger"] = {
      character: performer.data.name,
      modifier,
    };

    apply({
      applyAttrBonus: (bonus) => {
        this.updateAttrBonus(receivers, bonus, trigger);
      },
      applyAttkBonus: (bonus) => {
        this.updateAttkBonus(receivers, bonus, trigger);
      },
    });

    return receivers;
  };

  private modify = (event: ModifyEvent): [ProcessedModifyEvent, MemberControl[]] => {
    const { modifier } = event;
    const { inputs = [] } = modifier;
    const performer = this.member[event.performer.code];
    let description: string | undefined;
    let receivers: MemberControl[] = [];

    switch (modifier.type) {
      case "CHARACTER": {
        // #to-do: check if character can do this event (in case events are imported
        // but the modifier is not granted because of character's level/constellation)
        const buff = performer?.data.buffs?.find((buff) => buff.index === modifier.id);

        if (buff) {
          description = buff.src;
          receivers = this.baseModify(performer, buff.affect, description, (applyFn) => {
            performer.buffApplier.applyCharacterBuff({
              buff,
              description: "",
              inputs,
              ...applyFn,
            });
          });
        }
        break;
      }
      case "WEAPON": {
        const appWeapon = this.appWeapons[modifier.code];
        const buff = appWeapon.buffs?.find((buff) => buff.index === modifier.id);

        if (buff) {
          description = appWeapon.name;
          receivers = this.baseModify(performer, buff.affect, description, (applyFn) => {
            performer.buffApplier.applyWeaponBuff({
              buff,
              refi: 1,
              description: "",
              inputs,
              ...applyFn,
            });
          });
        }
        break;
      }
    }

    let error: string | undefined;

    if (!description) {
      error = "Cannot find the modifier.";
      description = `[${error}]`;
    }

    return [
      {
        ...event,
        description,
        error,
      },
      receivers,
    ];
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
