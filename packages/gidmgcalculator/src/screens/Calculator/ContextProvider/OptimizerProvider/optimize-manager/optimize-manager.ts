import type {
  OptimizeResult,
  OTM_InitRequest,
  OTM_LoadRequest,
  OTM_ManagerRequest,
  OTM_OptimizeRequest,
  OTM_ProcessInfo,
  OTM_WorkerResponse,
} from "./optimize-manager.types";
import { OptimizeTester } from "./optimize-tester";

const WORKER_URL = new URL("optimize-worker.ts", import.meta.url);

type OnCompleteOptimize = (state: OptimizeResult) => void;

export class OptimizeManager {
  private worker: Worker;
  private workerTerminated = false;
  private subscribers = new Set<OnCompleteOptimize>();

  private tester = new OptimizeTester();

  onStart = () => {};

  onProcess = (data: OTM_ProcessInfo) => {};

  constructor(private testMode = false) {
    this.worker = this.genWorker();
  }

  switchTestMode(testMode: boolean) {
    this.testMode = testMode;
    this.tester = new OptimizeTester(true);
  }

  private request(message: OTM_ManagerRequest) {
    this.worker.postMessage(message);
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
        case "__ONE": {
          this.tester.test(e.data);
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

    this.request({
      type: "INIT",
      params,
    });

    this.tester.init(params);
  }

  load(...params: OTM_LoadRequest["params"]) {
    this.request({
      type: "LOAD",
      params,
    });

    this.tester.load(params);
  }

  optimize(
    calcItemParams: OTM_OptimizeRequest["calcItemParams"],
    ...optimizeParams: OTM_OptimizeRequest["optimizeParams"]
  ) {
    this.onStart();

    this.request({
      type: "OPTIMIZE",
      testMode: this.testMode,
      calcItemParams,
      optimizeParams,
    });

    this.tester.optimize(optimizeParams);
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
