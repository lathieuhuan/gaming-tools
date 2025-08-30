import isEqual from "react-fast-compare";

import type { CalculationFinalResultItem, OptimizerAllArtifactModConfigs, OptimizerExtraConfigs } from "@Calculation";
import type { OTM_InitRequest, OTM_LoadRequest, OTM_OneRunResponse, OTM_OptimizeRequest } from "./types";

import { SetupOptimizer } from "../SetupOptimizer";

export class OptimizeTester {
  private optimizer?: SetupOptimizer;
  modConfig?: OptimizerAllArtifactModConfigs;
  extraConfigs?: OptimizerExtraConfigs;

  constructor(private active = false) {}

  init(params: OTM_InitRequest["params"]) {
    if (this.active) {
      this.optimizer = new SetupOptimizer(...params);
    }
  }

  load(params: OTM_LoadRequest["params"]) {
    if (this.active) {
      this.optimizer?.load(...params);
    }
  }

  optimize(optimizeParams: OTM_OptimizeRequest["optimizeParams"]) {
    if (this.active) {
      this.modConfig = optimizeParams[0];
      this.extraConfigs = optimizeParams[1];
    }
  }

  test(response: OTM_OneRunResponse) {
    const { artifacts, result, totalAttr, attkBonuses, output } = response;
    const handledResult = this.optimizer!.handleSet(artifacts, this.modConfig!);

    if (handledResult) {
      const [expectedtotalAttr, archive, calculator] = handledResult;
      const expectedAttkBonuses = archive.serialize();

      let expectedResult: CalculationFinalResultItem;

      switch (output.type) {
        case "RXN":
          expectedResult = calculator.genReactionCalculator().calculate(output.item.name);
          break;
        default:
          expectedResult = calculator
            .genTalentCalculator(output.type)
            .calculateItem(output.item, output.elmtModCtrls, output.infusedElmt);
      }

      if (!isEqual(result, expectedResult)) {
        console.log("UNEXPECTED RESULT");
        console.log("Expect:", expectedResult);
        console.log("Actual:", result);
      }
      if (!isEqual(totalAttr, expectedtotalAttr)) {
        console.log("UNEXPECTED TOTAL ATTRIBUTE");
        console.log("Expect:", expectedtotalAttr);
        console.log("Actual:", totalAttr);
      }
      if (!isEqual(attkBonuses, expectedAttkBonuses)) {
        console.log("UNEXPECTED ATTACK BONUSES");
        console.log("Expect:", expectedAttkBonuses);
        console.log("Actual:", attkBonuses);
      }
    }
  }
}
