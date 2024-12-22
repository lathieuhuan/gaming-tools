import type { OptimizeCalculation, OptimizeMessage, OptimizeResult } from "./optimizer-manager.types";
import { SetupOptimizer } from "@Backend";

let optimizer: SetupOptimizer;

onmessage = (e: MessageEvent<OptimizeMessage>) => {
  console.log("Message received from main script");
  console.log(e.data);

  switch (e.data.type) {
    case "INIT": {
      optimizer = new SetupOptimizer(...e.data.params);
      break;
    }
    case "LOAD": {
      optimizer?.load(...e.data.params);
      break;
    }
    case "OPTIMIZE": {
      const { calculateParams } = e.data;
      const calculations: OptimizeCalculation[] = [];
      let bestCalculation: OptimizeCalculation | undefined;

      optimizer.onOutput = (artifacts, totalAttr, attkBonusesArchive, calculator) => {
        const result = calculator
          .genAttPattCalculator(calculateParams.pattern)
          .calculate(calculateParams.calcItem, calculateParams.elmtModCtrls);

        const calculation: OptimizeCalculation = {
          damage: result.average,
          artifacts,
        };

        calculations.push(calculation);

        if (!bestCalculation || calculation.damage > bestCalculation.damage) {
          bestCalculation = calculation;
        }
      };

      optimizer?.optimize(...e.data.params);

      const result: OptimizeResult = {
        best: bestCalculation!,
        calculations,
      };

      postMessage(result);
      break;
    }
  }
};
