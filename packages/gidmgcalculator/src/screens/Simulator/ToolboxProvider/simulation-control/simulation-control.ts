import type { ModifierAffectType } from "@Backend";
import type {
  AttackReaction,
  HitEvent,
  ModifyEvent,
  SimulationChunk,
  SimulationEvent,
  SimulationMember,
  SimulationTarget,
} from "@Src/types";
import type { ProcessedHitEvent, ProcessedModifyEvent, SimulationProcessedEvent } from "../ToolboxProvider.types";
import type { MemberControl } from "./member-control";

import { SimulationControlCenter } from "./simulation-control-center";

export class SimulationControl extends SimulationControlCenter {
  constructor(party: SimulationMember[], target: SimulationTarget) {
    super(party, target);
  }

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
      return this.notifyChunksSubscribers();
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

    this.notifyChunksSubscribers();
  };

  private processNewEvent = (event: SimulationEvent, chunk: SimulationChunk) => {
    let processedEvent: SimulationProcessedEvent;
    this.sumary.duration += event.duration ?? 0;

    switch (event.type) {
      case "MODIFY":
        processedEvent = this.modify(event, chunk.ownerCode);
        break;
      case "HIT":
        processedEvent = this.hit(event);
        this.sumary.damage += processedEvent.damage.value;
        break;
    }
    const latestChunk = this.latestChunk;

    // Check if belongs to the latest chunk
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
    const { affect, attrBonuses, attkBonuses, source } = performer.modify(
      event,
      this.getAppWeaponOfMember(event.performer.code)
    );

    if (affect) {
      const receivers = this.getReceivers(performer, affect, onfieldMember);

      for (const bonus of attrBonuses) {
        receivers.forEach((receiver) => receiver.updateAttrBonus(bonus));
      }
      for (const bonus of attkBonuses) {
        receivers.forEach((receiver) => receiver.updateAttkBonus(bonus));
      }

      receivers.forEach((receiver) => receiver.applySimulationBonuses());

      if (receivers.includes(this.activeMember)) {
        this.notifyActiveMemberSubscribers();
      }

      return {
        ...event,
        description: source,
      };
    }

    const error = "Cannot find the modifier.";

    return {
      ...event,
      description: `[${error}]`,
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

        return {
          ...event,
          damage,
          reaction,
          description,
        };
      }
    }
  };
}

type MissmatchedCheckResult =
  | {
      isMissmatched: true;
    }
  | {
      isMissmatched: false;
      nextChunkIndex: number;
      nextEventIndex: number;
    };

export type SimulationManager = ReturnType<SimulationControl["genManager"]>;

export type ActiveMember = ReturnType<SimulationControl["genActiveMember"]>;
