import type { Artifact, CalcArtifacts, CalcSetup, Target } from "@Src/types";
import type {
  AttackBonuses,
  AttackPattern,
  CalcItem,
  OptimizerArtifactBuffConfigs,
  OptimizerExtraConfigs,
  TotalAttribute,
} from "../types";

import { $AppCharacter, $AppWeapon } from "@Src/services";
import { SetupOptimizer } from "../calculation/setup-optimizer";

type OptimizeCalculation = {
  artifacts: CalcArtifacts;
  damage: number | number[];
  totalAttr: TotalAttribute;
  attkBonuses: AttackBonuses;
};

export function optimizeSetup(
  item: CalcItem,
  patternCate: AttackPattern,
  setup: CalcSetup,
  artifacts: Artifact[],
  target: Target,
  artifactBuffConfigs: OptimizerArtifactBuffConfigs,
  extraConfigs: OptimizerExtraConfigs
) {
  console.time();

  const { char, weapon, party, elmtModCtrls, customInfusion } = setup;
  const appChar = $AppCharacter.get(char.name);
  const appWeapon = $AppWeapon.get(weapon.code)!;
  const partyData = $AppCharacter.getPartyData(party);

  const calculations: OptimizeCalculation[] = [];
  let bestCalculation: OptimizeCalculation | undefined;

  const optimizer = new SetupOptimizer(setup, appChar, appWeapon, partyData).load(artifacts, target);

  optimizer.onOutput = (artifacts, totalAttr, attkBonusesArchive, calculator) => {
    const result = calculator.genAttPattCalculator(patternCate).calculate(item, elmtModCtrls);

    const calculation: OptimizeCalculation = {
      damage: result.average,
      artifacts,
      totalAttr,
      attkBonuses: attkBonusesArchive.serialize(),
    };

    calculations.push(calculation);

    if (!bestCalculation || calculation.damage > bestCalculation.damage) {
      bestCalculation = calculation;
    }
  };

  optimizer.optimize(artifactBuffConfigs);

  console.timeEnd();
  console.log(bestCalculation);
}
