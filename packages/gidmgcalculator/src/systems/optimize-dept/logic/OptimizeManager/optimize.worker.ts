import type { OptimizeCalculation } from "@OptimizeDept/types";
import type { OTM_ManagerRequest, OTM_WorkerResponse } from "./types";

import { CalculationFinalResultItem } from "@Calculation";
import { CalculationSorter } from "../CalculationSorter";
import { SetupOptimizer } from "../SetupOptimizer";

let optimizer: SetupOptimizer;
const sorter = new CalculationSorter();
const COMPLETE_DELAY = 300;

// console.log(typeof this);
// console.log(typeof window);

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
      const { output, testMode } = e.data;
      const calculations: OptimizeCalculation[] = [];

      optimizer.onOutput = (artifacts, totalAttr, attkBonusesArchive, calculator) => {
        let result: CalculationFinalResultItem;

        switch (output.type) {
          case "RXN":
            result = calculator.genReactionCalculator().calculate(output.item.name);
            break;
          default: {
            result = calculator
              .genTalentCalculator(output.type)
              .calculateItem(output.item, output.elmtModCtrls, output.infusedElmt);
          }
        }

        const calculation: OptimizeCalculation = {
          damage: result.average,
          artifacts,
        };

        calculations.push(calculation);
        sorter.add(calculation);

        if (testMode) {
          response({
            type: "__ONE",
            artifacts,
            output,
            totalAttr,
            attkBonuses: attkBonusesArchive.serialize(),
            result,
          });
        }
      };

      optimizer?.optimize(...e.data.optimizeParams);

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
