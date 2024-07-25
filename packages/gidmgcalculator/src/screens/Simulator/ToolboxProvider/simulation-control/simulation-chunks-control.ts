import { SimulationProcessedChunk, SimulationSumary } from "../ToolboxProvider.types";

type OnChangeChunks = (chunks: SimulationProcessedChunk[], sumary: SimulationSumary) => void;

export class SimulationChunksControl {
  protected chunks: SimulationProcessedChunk[] = [];
  protected sumary: SimulationSumary = {
    damage: 0,
    duration: 0,
  };
  protected chunksSubscribers = new Set<OnChangeChunks>();

  protected get latestChunk() {
    return this.chunks[this.chunks.length - 1];
  }

  protected subscribeChunks = (callback: OnChangeChunks) => {
    this.chunksSubscribers.add(callback);

    const unsubscribe = () => {
      this.chunksSubscribers.delete(callback);
    };

    return {
      initialChunks: this.chunks,
      initialSumary: this.sumary,
      unsubscribe,
    };
  };

  protected notifyChunksSubscribers = () => {
    // console.log("notifyChunksSubscribers");
    // console.log(this.chunks);
    // console.log(receivers);

    this.chunksSubscribers.forEach((callback) => callback(this.chunks.concat(), this.sumary));
  };
}
