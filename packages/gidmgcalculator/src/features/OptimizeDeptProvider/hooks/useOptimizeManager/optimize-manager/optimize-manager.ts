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
import WORKER_URL from "./optimize-worker?worker&url";

type OnCompleteOptimize = (state: OptimizeResult) => void;

type OnProcessOptimize = (info: OTM_ProcessInfo) => void;

export class OptimizeManager {
  private worker: Worker;
  private workerTerminated = false;
  private processInfo: OTM_ProcessInfo = {
    percent: 0,
    time: 0,
  };
  private completeSubscribers = new Set<OnCompleteOptimize>();
  private processSubscribers = new Set<OnProcessOptimize>();

  private tester = new OptimizeTester();

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
          this.processInfo = e.data.info;
          this.notifyProcess(e.data.info);
          break;
        case "COMPLETE": {
          this.notifyComplete(e.data.result);
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

  private notifyComplete = (state: OptimizeResult) => {
    this.completeSubscribers.forEach((subscriber) => subscriber(state));
  };

  private notifyProcess = (info: OTM_ProcessInfo) => {
    this.processSubscribers.forEach((subscriber) => subscriber(info));
  };

  subscribeCompletion = (subscriber: OnCompleteOptimize) => {
    this.completeSubscribers.add(subscriber);

    return () => {
      this.completeSubscribers.delete(subscriber);
    };
  };

  subscribeProcess = (subscriber: OnProcessOptimize) => {
    this.processSubscribers.add(subscriber);

    return {
      currentProcess: this.processInfo,
      unsubscribe: () => {
        this.processSubscribers.delete(subscriber);
      },
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
    this.processInfo = {
      percent: 0,
      time: 0,
    };

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
