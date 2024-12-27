import type { OptimizeCalculation, ManagerRequest, WorkerResponse } from "./optimizer-manager.types";
import { SetupOptimizer } from "@Backend";
import { CalculationSorter } from "./calculation-sorter";

let optimizer: SetupOptimizer;
const sorter = new CalculationSorter();

function response(message: WorkerResponse) {
  postMessage(message);
}

onmessage = (e: MessageEvent<ManagerRequest>) => {
  switch (e.data.type) {
    case "INIT": {
      optimizer = new SetupOptimizer(...e.data.params);

      optimizer.onReachMilestone = (percent) => [
        response({
          type: "PROCESS",
          percent,
        }),
      ];
      break;
    }
    case "LOAD": {
      optimizer?.load(...e.data.params);
      break;
    }
    case "OPTIMIZE": {
      const { calculateParams } = e.data;
      const calculations: OptimizeCalculation[] = [];

      optimizer.onOutput = (artifacts, totalAttr, attkBonusesArchive, calculator) => {
        const result = calculator
          .genAttPattCalculator(calculateParams.pattern)
          .calculate(calculateParams.calcItem, calculateParams.elmtModCtrls);

        const calculation: OptimizeCalculation = {
          damage: result.average,
          artifacts,
        };

        calculations.push(calculation);
        sorter.add(calculation);
      };

      optimizer?.optimize(...e.data.params);

      // const result: OptimizeResult = {
      //   bests: sorter.get(),
      //   calculations,
      // };

      response({
        type: "COMPLETE",
        result: sorter.get(),
      });
      break;
    }
  }
};
