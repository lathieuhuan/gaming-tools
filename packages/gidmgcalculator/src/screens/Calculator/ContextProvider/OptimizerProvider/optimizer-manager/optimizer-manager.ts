import type {
  InitRequest,
  LoadRequest,
  OptimizeRequest,
  OptimizeResult,
  WorkerResponse,
} from "./optimizer-manager.types";

const WORKER_URL = new URL("optimizer-worker.ts", import.meta.url);

type OnCompleteOptimize = (state: OptimizeResult) => void;

export class OptimizerManager {
  private worker: Worker;
  private subscribers = new Set<OnCompleteOptimize>();

  onStart = () => {};

  onProcess = (percent: number) => {};

  constructor() {
    this.worker = new Worker(WORKER_URL, { type: "module" });

    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      switch (e.data.type) {
        case "PROCESS":
          this.onProcess(e.data.percent);
          break;
        case "COMPLETE": {
          this.notify(e.data.result);
          break;
        }
      }
    };
  }

  private notify = (state: OptimizeResult) => {
    this.subscribers.forEach((subscriber) => subscriber(state));
  };

  subscribeCompletion = (subscriber: OnCompleteOptimize) => {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  init(...params: InitRequest["params"]) {
    this.worker.postMessage({
      type: "INIT",
      params,
    });
  }

  load(...params: LoadRequest["params"]) {
    this.worker.postMessage({
      type: "LOAD",
      params,
    });
  }

  optimize(calculateParams: OptimizeRequest["calculateParams"], params: OptimizeRequest["params"]) {
    this.onStart();

    this.worker.postMessage({
      type: "OPTIMIZE",
      calculateParams,
      params,
    });
  }

  end() {
    try {
      this.worker.terminate();
    } catch (error) {
      //
    }
  }
}
