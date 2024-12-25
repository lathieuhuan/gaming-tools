import type { SetupOptimizer } from "@Backend";
import type { LoadRequest, OptimizeRequest, OptimizeResult } from "./optimizer-manager.types";

const WORKER_URL = new URL("optimizer-worker.ts", import.meta.url);

export type OptimizeProgress = {
  loading: boolean;
  result: OptimizeResult;
};

type OnCompleteOptimize = (state: OptimizeProgress) => void;

export class OptimizerManager {
  private worker: Worker;
  private subscribers = new Set<OnCompleteOptimize>();

  onComplete = (result: OptimizeResult) => {};

  constructor(...params: ConstructorParameters<typeof SetupOptimizer>) {
    this.worker = new Worker(WORKER_URL, { type: "module" });

    this.worker.onmessage = (e: MessageEvent<OptimizeResult>) => {
      this.notify({
        loading: false,
        result: e.data,
      });
      this.onComplete(e.data);
    };

    this.worker.postMessage({
      type: "INIT",
      params,
    });
  }

  private notify = (state: OptimizeProgress) => {
    this.subscribers.forEach((subscriber) => subscriber(state));
  };

  subscribe = (subscriber: OnCompleteOptimize) => {
    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  // init(...params: InitRequest["params"]) {
  //   this.worker.postMessage({
  //     type: "INIT",
  //     params,
  //   });
  // }

  load(...params: LoadRequest["params"]) {
    this.worker.postMessage({
      type: "LOAD",
      params,
    });
  }

  optimize(calculateParams: OptimizeRequest["calculateParams"], params: OptimizeRequest["params"]) {
    this.notify({
      loading: true,
      result: [],
    });

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
