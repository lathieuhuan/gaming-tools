import type { SimulationChunk, SimulationEvent } from "@Src/types";
import type { SimulationProcessedEvent } from "./simulation-control.types";
import { SimulationControlCenter } from "./simulation-control-center";

export class SimulationControl extends SimulationControlCenter {
  //
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

    const didRemoveBufferChunk = this.removeBufferChunk();

    if (didRemoveBufferChunk) {
      // ???
      this.switchOnfield(chunks[chunks.length - 1].ownerCode);
    }
    if (this.chunks.length > chunks.length) {
      // #to-do check if the redundant chunks are all hit events
      // => not missmatched but need to remove damage
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
    const result = this.checkMissmatched(chunks);

    // console.log("==================");
    // console.log({ ...result });

    if (result.isMissmatched) {
      this.resetChunks();
      this.resetBonuses();

      for (const chunk of chunks) {
        this.switchOnfield(chunk.ownerCode);

        if (chunk.events.length) {
          chunk.events.forEach((event, i) => this.processNewEvent(event, chunk));
        } else {
          this.addBufferChunk(chunk);
        }
      }
      return this.notifyChunksSubscribers();
    }

    for (let chunkIndex = result.nextChunkIndex; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      const startEventIndex = chunkIndex === result.nextChunkIndex ? result.nextEventIndex : 0;

      if (!startEventIndex) {
        this.switchOnfield(chunk.ownerCode);
      }

      if (chunk.events.length) {
        for (let eventIndex = startEventIndex; eventIndex < chunk.events.length; eventIndex++) {
          this.processNewEvent(chunk.events[eventIndex], chunk);
        }
      }
      // Switch character, empty chunk.
      else {
        this.addBufferChunk(chunk);
      }
    }

    this.notifyChunksSubscribers();
  };

  private processNewEvent = (event: SimulationEvent, chunk: SimulationChunk) => {
    let processedEvent: SimulationProcessedEvent;

    this.forEachMember((control) => control.innateModify());

    switch (event.type) {
      case "SYSTEM_MODIFY":
        processedEvent = this.systemModify(event);
        break;
      case "MODIFY":
        processedEvent = this.entityModify(event);
        break;
      case "HIT":
        processedEvent = this.hit(event);
        break;
    }

    this.addEvent(processedEvent, chunk);
  };
}

/** If not missmatched, also give the next chunk index & next event index need processing */
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
