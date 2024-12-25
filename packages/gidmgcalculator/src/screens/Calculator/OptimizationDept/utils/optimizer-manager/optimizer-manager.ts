import type { SetupOptimizer } from "@Backend";
import type { LoadRequest, OptimizeRequest, OptimizeResult } from "./optimizer-manager.types";

const WORKER_URL = new URL("optimizer-worker.ts", import.meta.url);

type OnCompleteOptimize = (result: OptimizeResult) => void;

export class OptimizerManager {
  private worker: Worker;
  private subscribers = new Set<OnCompleteOptimize>();

  constructor(...params: ConstructorParameters<typeof SetupOptimizer>) {
    this.worker = new Worker(WORKER_URL, { type: "module" });

    this.worker.onmessage = (e: MessageEvent<OptimizeResult>) => {
      this.notify(e.data);
    };

    this.worker.postMessage({
      type: "INIT",
      params,
    });
  }

  private notify = (result: OptimizeResult) => {
    console.log("optimize result");
    console.log(result);

    this.subscribers.forEach((subscriber) => subscriber(result));
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
    this.worker.postMessage({
      type: "OPTIMIZE",
      calculateParams,
      params,
    });
  }

  end() {
    try {
      console.log("terminate");
      this.worker.terminate();
    } catch (error) {
      //
    }
  }
}
