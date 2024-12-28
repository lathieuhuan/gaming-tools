import type {
  OTM_InitRequest,
  OTM_LoadRequest,
  OTM_OptimizeRequest,
  OptimizeResult,
  OTM_WorkerResponse,
  OTM_ProcessInfo,
} from "./optimizer-manager.types";

const WORKER_URL = new URL("optimizer-worker.ts", import.meta.url);

type OnCompleteOptimize = (state: OptimizeResult) => void;

export class OptimizerManager {
  private worker: Worker;
  private workerTerminated = false;
  private subscribers = new Set<OnCompleteOptimize>();

  onStart = () => {};

  onProcess = (data: OTM_ProcessInfo) => {};

  constructor() {
    this.worker = this.genWorker();
  }

  private genWorker = () => {
    const worker = new Worker(WORKER_URL, { type: "module" });

    worker.onmessage = (e: MessageEvent<OTM_WorkerResponse>) => {
      switch (e.data.type) {
        case "PROCESS":
          this.onProcess(e.data.info);
          break;
        case "COMPLETE": {
          this.notify(e.data.result);
          console.log("runTime:", e.data.runTime);
          break;
        }
      }
    };
    return worker;
  };

  private notify = (state: OptimizeResult) => {
    this.subscribers.forEach((subscriber) => subscriber(state));
  };

  subscribeCompletion = (subscriber: OnCompleteOptimize) => {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  init(...params: OTM_InitRequest["params"]) {
    if (this.workerTerminated) {
      this.end();
      this.worker = this.genWorker();
      this.workerTerminated = false;
    }

    this.worker.postMessage({
      type: "INIT",
      params,
    });
  }

  load(...params: OTM_LoadRequest["params"]) {
    this.worker.postMessage({
      type: "LOAD",
      params,
    });
  }

  optimize(calculateParams: OTM_OptimizeRequest["calculateParams"], params: OTM_OptimizeRequest["params"]) {
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
      this.workerTerminated = true;
    } catch (error) {
      //
    }
  }
}
