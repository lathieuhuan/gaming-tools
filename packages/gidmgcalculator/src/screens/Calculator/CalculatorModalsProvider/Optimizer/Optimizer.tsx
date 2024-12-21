import { useMemo, useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { ButtonGroup, SwitchNode } from "rond";
import { OptimizerArtifactBuffConfigs, OptimizerExtraConfigs, SetupOptimizer } from "@Backend";

import type { ArtifactFilterSet } from "@Src/components/ArtifactFilter";
import type { CalcArtifacts } from "@Src/types";

import { useStoreSnapshot } from "@Src/features";
import { $AppWeapon } from "@Src/services";
import Modifier_ from "@Src/utils/modifier-utils";
import { useCharacterData, usePartyData } from "../../contexts";
import { StepArtifactModConfig } from "./StepArtifactModConfig";
import { StepArtifactSetSelect } from "./StepArtifactSetSelect";
import { SelectedCalcItem, StepCalcItemSelect } from "./StepCalcItemSelect";
import { StepExtraConfigs } from "./StepExtraConfigs";

type SavedValues = {
  calcItem: SelectedCalcItem;
  filterSets: ArtifactFilterSet[];
  setCodes: number[];
  buffConfigs: OptimizerArtifactBuffConfigs;
  extraConfigs: OptimizerExtraConfigs;
};

type SaveCalculation = {
  damage: number | number[];
  artifacts: CalcArtifacts;
};

export function Optimizer() {
  const store = useStoreSnapshot(({ calculator, userdb }) => {
    const setup = calculator.setupsById[calculator.activeId];
    const target = calculator.target;
    const artifacts = userdb.userArts;

    return {
      setup,
      target,
      artifacts,
    };
  });
  const appChar = useCharacterData();
  const partyData = usePartyData();

  const savedValues = useRef<Partial<SavedValues>>({});
  const [step, setStep] = useState(0);
  // const [stepValids, setStepValids] = useState<boolean[]>([false, true, true, true]);

  const FORM_IDS = ["calc-item", "artifact-set", "artifact-modifier", "extra-config"];
  const currentFormId = FORM_IDS[step];

  const optimizer = useMemo(() => {
    const appWeapon = $AppWeapon.get(store.setup.weapon.code)!;
    return new SetupOptimizer(store.target, store.setup, appChar, appWeapon, partyData);
  }, []);

  const optimizeSetup = () => {
    console.time("OPTIMIZER");

    const { calcItem, setCodes, buffConfigs, extraConfigs } = savedValues.current;

    const calculations: SaveCalculation[] = [];
    let bestCalculation: SaveCalculation | undefined;

    optimizer.onOutput = (artifacts, totalAttr, attkBonusesArchive, calculator) => {
      const result = calculator
        .genAttPattCalculator(calcItem!.patternCate)
        .calculate(calcItem!.value, store.setup.elmtModCtrls);

      const calculation: SaveCalculation = {
        damage: result.average,
        artifacts,
      };

      calculations.push(calculation);

      if (!bestCalculation || calculation.damage > bestCalculation.damage) {
        bestCalculation = calculation;
      }
    };

    optimizer.optimize(buffConfigs!, extraConfigs!);

    console.timeEnd("OPTIMIZER");
    console.log(bestCalculation);
  };

  const navigateStep = (stepDiff: number) => {
    const newStep = step + stepDiff;

    if (newStep >= FORM_IDS.length) {
      return optimizeSetup();
    }

    setStep(newStep);
  };

  // const changeValid = (index: number, valid: boolean) => {
  //   const currentValid = stepValids[index] || false;

  //   if (currentValid !== valid) {
  //     const newValids = [...stepValids];
  //     newValids[index] = valid;
  //     setStepValids(newValids);
  //   }
  // };

  const saveConfig = <TKey extends keyof SavedValues>(key: TKey, value: SavedValues[TKey]) => {
    savedValues.current[key] = value;
    navigateStep(1);
  };

  const onSubmitArtifactSets = (sets: ArtifactFilterSet[]): string | undefined => {
    const setCodes: number[] = [];

    const newBuffConfig = {
      ...savedValues.current.buffConfigs,
    };

    for (const { code, data } of sets) {
      setCodes.push(code);

      if (!newBuffConfig[code] && data.buffs) {
        newBuffConfig[code] = data.buffs.map<OptimizerArtifactBuffConfigs[number][number]>((buff) => ({
          index: buff.index,
          activated: true,
          inputs: Modifier_.createModCtrlInpus(buff.inputConfigs, true),
        }));
      }
    }

    const artifacts = store.artifacts.filter((artifact) => setCodes.includes(artifact.code));
    const possibleSetCount = optimizer.load(artifacts);

    console.log("possibleSetCount", possibleSetCount);

    if (possibleSetCount > 50_000) {
      return "To many artifact, please narrow their number down.";
    }

    savedValues.current.filterSets = sets;
    savedValues.current.buffConfigs = newBuffConfig;
    saveConfig("setCodes", setCodes);
  };

  return (
    <div className="h-full flex flex-col hide-scrollbar" style={{ height: "80vh" }}>
      <div className="grow hide-scrollbar">
        <SwitchNode
          value={step}
          cases={[
            {
              value: 0,
              element: (
                <StepCalcItemSelect
                  id={currentFormId}
                  initialValue={savedValues.current?.calcItem}
                  onSubmit={(calcItem) => saveConfig("calcItem", calcItem)}
                />
              ),
            },
            {
              value: 1,
              element: (
                <StepArtifactSetSelect
                  id={currentFormId}
                  initialValue={savedValues.current?.setCodes}
                  artifacts={store.artifacts}
                  onSubmit={onSubmitArtifactSets}
                />
              ),
            },
            {
              value: 2,
              element: (
                <StepArtifactModConfig
                  id={currentFormId}
                  initialValue={{
                    buffs: savedValues.current.buffConfigs,
                  }}
                  artifactSets={savedValues.current.filterSets}
                  onSubmit={(config) => saveConfig("buffConfigs", config.buffs)}
                />
              ),
            },
            {
              value: 3,
              element: (
                <StepExtraConfigs
                  id={currentFormId}
                  initialValue={savedValues.current.extraConfigs}
                  onSubmit={(config) => saveConfig("extraConfigs", config)}
                />
              ),
            },
          ]}
        />
      </div>

      <ButtonGroup
        className="mt-3 mb-1"
        buttons={[
          {
            children: "Back",
            icon: <FaCaretRight className="text-lg rotate-180" />,
            disabled: !step,
            onClick: () => navigateStep(-1),
          },
          {
            type: "submit",
            children: "Next",
            icon: <FaCaretRight className="text-lg" />,
            iconPosition: "end",
            // disabled: !stepValids[step],
            form: FORM_IDS[step],
          },
        ]}
      />
    </div>
  );
}
