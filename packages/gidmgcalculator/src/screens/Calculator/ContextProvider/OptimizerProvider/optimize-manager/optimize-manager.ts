import type {
  OTM_InitRequest,
  OTM_LoadRequest,
  OTM_OptimizeRequest,
  OptimizeResult,
  OTM_WorkerResponse,
  OTM_ProcessInfo,
} from "./optimize-manager.types";

const WORKER_URL = new URL("optimizer-worker.ts", import.meta.url);

type OnCompleteOptimize = (state: OptimizeResult) => void;

export class OptimizeManager {
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

  optimize(
    calcItemParams: OTM_OptimizeRequest["calcItemParams"],
    ...optimizeParams: OTM_OptimizeRequest["optimizeParams"]
  ) {
    this.onStart();

    this.worker.postMessage({
      type: "OPTIMIZE",
      calcItemParams,
      optimizeParams,
    });
  }

  end() {
    try {
      this.worker.terminate();
      this.workerTerminated = true;
    } catch (error) {
      console.error(error);
    }
  }
}
