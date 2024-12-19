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
import { CalcItemCalculator } from "../calculation-utils/calc-item-calculator";
import { OptimizerInputProcessor } from "../calculation/optimizer-input-processor";

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

  const processor = new OptimizerInputProcessor(setup, appChar, appWeapon, partyData).loadInputs(
    artifacts,
    artifactBuffConfigs,
    target
  );

  const calculations: OptimizeCalculation[] = [];
  let bestCalculation: OptimizeCalculation | undefined;

  processor.process((artifacts, totalAttr, attkBonusesArchive, resistances, NAsConfig) => {
    const result = new CalcItemCalculator(
      target.level,
      {
        char,
        appChar,
        partyData,
      },
      NAsConfig,
      customInfusion,
      totalAttr,
      attkBonusesArchive,
      resistances
    )
      .genAttPattCalculator(patternCate)
      .calculate(item, elmtModCtrls);

    const calculation: OptimizeCalculation = {
      damage: result.average,
      artifacts,
      totalAttr,
      attkBonuses: attkBonusesArchive.serialize(),
    };

    calculations.push(calculation);

    if (calculation.damage > (bestCalculation?.damage || 0)) {
      bestCalculation = calculation;
    }
  });

  console.timeEnd();
  console.log(bestCalculation);
}
