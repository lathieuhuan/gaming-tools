import { GeneralCalc, type AppWeapon, type ModifierAffectType } from "@Backend";
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

  private get latestChunk() {
    return this.chunks[this.chunks.length - 1];
  }

  constructor(party: SimulationMember[], target: SimulationTarget) {
    this.partyData = party.map((member) => $AppCharacter.get(member.name));
    this.target = target;

    // Resonance
    const resonanceBonus: SimulationAttributeBonus[] = [];
    const { pyro = 0, hydro = 0 } = GeneralCalc.countElements(this.partyData);

    if (pyro >= 2) {
      // resonanceBonus.push()
    }

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
        this.partyData,
        resonanceBonus
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
    // console.log(receivers);

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
    if (!this.latestChunk.events.length) {
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

    // console.log("==================");
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
          chunk.events.forEach((event, i) => this.processNewEvent(event, chunk));
        } else {
          this.chunks.push({
            ...chunk,
            events: [],
          });
        }
      }
      return this.onChangeEvents();
    }

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

    this.onChangeEvents();
  };

  private processNewEvent = (event: SimulationEvent, chunk: SimulationChunk) => {
    let processedEvent: SimulationProcessedEvent;

    switch (event.type) {
      case "MODIFY":
        processedEvent = this.modify(event, chunk.ownerCode);
        break;
      case "HIT":
        processedEvent = this.hit(event);
        break;
    }
    const latestChunk = this.latestChunk;

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

  private getReceivers = (
    performer: MemberControl,
    affect: ModifierAffectType,
    onfieldMember: number
  ): MemberControl[] => {
    switch (affect) {
      case "SELF":
        return [performer];
      case "PARTY":
        return this.partyData.map((data) => this.member[data.code]);
      case "ACTIVE_UNIT": {
        const memberCtrl = this.member[onfieldMember];
        return memberCtrl ? [memberCtrl] : [];
      }
      default:
        return [];
    }
  };

  private modify = (event: ModifyEvent, onfieldMember: number): ProcessedModifyEvent => {
    const performer = this.member[event.performer.code];

    let description: string | undefined;
    let receivers: MemberControl[] = [];

    performer.modify(event, this.appWeapons[event.modifier.code], (affect) => {
      receivers = this.getReceivers(performer, affect, onfieldMember);

      return {
        applyAttrBonus: (bonus) => {
          description = bonus.description;
          receivers.forEach((receiver) => receiver.updateAttrBonus(bonus));
        },
        applyAttkBonus: (bonus) => {
          description = bonus.description;
          receivers.forEach((receiver) => receiver.updateAttkBonus(bonus));
        },
      };
    });

    receivers.forEach((receiver) => receiver.applySimulationBonuses());

    let error: string | undefined;

    if (!description) {
      error = "Cannot find the modifier.";
      description = `[${error}]`;
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
