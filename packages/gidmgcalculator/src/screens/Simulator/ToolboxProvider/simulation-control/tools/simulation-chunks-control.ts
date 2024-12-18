import type { DeepReadonly } from "rond";
import type { SimulationChunk } from "@Src/types";
import type { SimulationProcessedChunk, SimulationProcessedEvent, SimulationSumary } from "../simulation-control.types";

type OnChangeChunks = (chunks: SimulationProcessedChunk[], sumary: SimulationSumary) => void;

/**
 * This class is for managing SimulationProcessedChunk[] and their SimulationSumary,
 * also notifying subscribers of such chunks.
 */
export class SimulationChunksControl {
  private _chunks: SimulationProcessedChunk[] = [];
  private _sumary: SimulationSumary = {
    damage: 0,
    duration: 0,
  };
  private chunksSubscribers = new Set<OnChangeChunks>();

  protected get chunks(): DeepReadonly<SimulationProcessedChunk[]> {
    return this._chunks;
  }

  protected get sumary(): DeepReadonly<SimulationSumary> {
    return this._sumary;
  }

  protected subscribeChunks = (callback: OnChangeChunks) => {
    this.chunksSubscribers.add(callback);

    const unsubscribe = () => {
      this.chunksSubscribers.delete(callback);
    };

    return {
      initialChunks: this._chunks,
      initialSumary: this._sumary,
      unsubscribe,
    };
  };

  protected notifyChunksSubscribers = () => {
    // console.log("notifyChunksSubscribers");
    // console.log(this._chunks);
    // console.log(receivers);

    this.chunksSubscribers.forEach((callback) => callback(this._chunks.concat(), this._sumary));
  };

  /**
   * @return if there was a buffer chunk (aka. the empty chunk) removed
   */
  protected removeBufferChunk = () => {
    const lastChunkIsBuffer = !this._chunks.at(-1)?.events.length;

    if (lastChunkIsBuffer) {
      this._chunks.pop();
    }
    return lastChunkIsBuffer;
  };

  protected addBufferChunk = (chunk: Omit<SimulationChunk, "events">) => {
    this._chunks.push({
      ...chunk,
      events: [],
    });
  };

  protected addEvent = (event: SimulationProcessedEvent, chunk: SimulationChunk) => {
    const latestChunk = this._chunks.at(-1);

    // Check if belongs to the latest chunk
    if (latestChunk && chunk.id === latestChunk.id) {
      latestChunk.events.push(event);
    } else {
      this._chunks.push({
        ...chunk,
        events: [event],
      });
    }

    if ("damage" in event) {
      this._sumary.damage += event.damage.value;
    }
    this._sumary.duration += event.duration ?? 0;
  };

  protected resetChunks = () => {
    this._chunks = [];
    this._sumary = {
      damage: 0,
      duration: 0,
    };
  };
}
