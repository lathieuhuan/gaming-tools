import type { OptimizeCalculation, OTM_ManagerRequest, OTM_WorkerResponse } from "./optimizer-manager.types";
import { SetupOptimizer } from "@Backend";
import { CalculationSorter } from "./calculation-sorter";

let optimizer: SetupOptimizer;
const sorter = new CalculationSorter();
const COMPLETE_DELAY = 300;

function response(message: OTM_WorkerResponse) {
  postMessage(message);
}

onmessage = (e: MessageEvent<OTM_ManagerRequest>) => {
  switch (e.data.type) {
    case "INIT": {
      optimizer = new SetupOptimizer(...e.data.params);

      optimizer.onReachMilestone = (info) => {
        response({
          type: "PROCESS",
          info,
        });
      };
      break;
    }
    case "LOAD": {
      optimizer?.load(...e.data.params);
      break;
    }
    case "OPTIMIZE": {
      const { calcItemParams } = e.data;
      const calculations: OptimizeCalculation[] = [];

      optimizer.onOutput = (artifacts, totalAttr, attkBonusesArchive, calculator) => {
        const result = calculator
          .genAttPattCalculator(calcItemParams.pattern)
          .calculate(calcItemParams.calcItem, calcItemParams.elmtModCtrls);

        const calculation: OptimizeCalculation = {
          damage: result.average,
          artifacts,
        };

        calculations.push(calculation);
        sorter.add(calculation);
      };

      optimizer?.optimize(...e.data.optimizeParams);

      // const result: OptimizeResult = {
      //   bests: sorter.get(),
      //   calculations,
      // };
      const result = sorter.get();

      setTimeout(() => {
        response({
          type: "COMPLETE",
          runTime: optimizer.runTime,
          result,
        });
      }, COMPLETE_DELAY);

      break;
    }
  }
};
