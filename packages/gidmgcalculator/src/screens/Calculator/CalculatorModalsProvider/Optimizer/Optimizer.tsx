import { useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { ButtonGroup } from "rond";
import { optimizeSetup, OptimizerArtifactBuffConfigs, OptimizerExtraConfigs } from "@Backend";

import type { ArtifactFilterSet } from "@Src/components/ArtifactFilter/hooks";
import { useStore } from "@Src/features";
import Modifier_ from "@Src/utils/modifier-utils";
import { selectActiveId, selectCalcSetupsById, selectTarget } from "@Store/calculator-slice";
import { selectUserArtifacts } from "@Store/userdb-slice";
import { StepArtifactModConfig } from "./StepArtifactModConfig";
import { StepArtifactSetSelect } from "./StepArtifactSetSelect";
import { SelectedCalcItem, StepCalcItemSelect } from "./StepCalcItemSelect";
import { StepExtraConfigs } from "./StepExtraConfigs";
import Object_ from "@Src/utils/object-utils";

type SavedValues = {
  calcItem: SelectedCalcItem;
  filterSets: ArtifactFilterSet[];
  setCodes: Set<number>;
  buffConfigs: OptimizerArtifactBuffConfigs;
  extraConfigs: OptimizerExtraConfigs;
};

export function Optimizer() {
  const store = useStore();
  const savedValues = useRef<Partial<SavedValues>>({});
  const [step, setStep] = useState(0);
  const [stepValids, setStepValids] = useState<boolean[]>([false, false, true, true]);

  const FORM_IDS = ["calc-item", "artifact-set", "artifact-modifier", "extra-config"];
  const currentFormId = FORM_IDS[step];

  const navigateStep = (stepDiff: number) => {
    const newStep = step + stepDiff;

    if (newStep >= FORM_IDS.length) {
      const config = savedValues.current;
      const setup = store.select(selectCalcSetupsById)[store.select(selectActiveId)];
      const artifacts = store.select(selectUserArtifacts).filter((artifact) => config.setCodes!.has(artifact.code));
      const target = store.select(selectTarget);

      optimizeSetup(
        config.calcItem!.value,
        config.calcItem!.patternCate,
        Object_.clone(setup),
        artifacts,
        target,
        config.buffConfigs!,
        config.extraConfigs!
      );
      return;
    }

    setStep(newStep);
  };

  const changeValid = (index: number, valid: boolean) => {
    const currentValid = stepValids[index] || false;

    if (currentValid !== valid) {
      const newValids = [...stepValids];
      newValids[index] = valid;
      setStepValids(newValids);
    }
  };

  const saveConfig = <TKey extends keyof SavedValues>(key: TKey, value: SavedValues[TKey]) => {
    savedValues.current[key] = value;
    navigateStep(1);
  };

  const onSubmitArtifactSets = (sets: ArtifactFilterSet[]) => {
    const setCodes = new Set<number>();

    const newBuffConfig = {
      ...savedValues.current.buffConfigs,
    };

    for (const { code, data } of sets) {
      setCodes.add(code);

      if (!newBuffConfig[code] && data.buffs) {
        newBuffConfig[code] = data.buffs.map<OptimizerArtifactBuffConfigs[number][number]>((buff) => ({
          index: buff.index,
          activated: true,
          inputs: Modifier_.createModCtrlInpus(buff.inputConfigs, true),
        }));
      }
    }

    savedValues.current.filterSets = sets;
    savedValues.current.buffConfigs = newBuffConfig;
    saveConfig("setCodes", setCodes);
  };

  let stepRender: React.ReactNode;

  switch (step) {
    case 0:
      stepRender = (
        <StepCalcItemSelect
          id={currentFormId}
          initialValue={savedValues.current?.calcItem}
          onChangeValid={(valid) => changeValid(0, valid)}
          onSubmit={(calcItem) => saveConfig("calcItem", calcItem)}
        />
      );
      break;
    case 1: {
      stepRender = (
        <StepArtifactSetSelect
          id={currentFormId}
          initialValue={savedValues.current?.setCodes}
          onChangeValid={(valid) => changeValid(1, valid)}
          onSubmit={onSubmitArtifactSets}
        />
      );
      break;
    }
    case 2: {
      stepRender = (
        <StepArtifactModConfig
          id={currentFormId}
          initialValue={{
            buffs: savedValues.current.buffConfigs,
          }}
          artifactSets={savedValues.current.filterSets}
          onChangeValid={(valid) => changeValid(2, valid)}
          onSubmit={(config) => saveConfig("buffConfigs", config.buffs)}
        />
      );
      break;
    }
    case 3:
      stepRender = (
        <StepExtraConfigs
          id={currentFormId}
          initialValue={savedValues.current.extraConfigs}
          onChangeValid={(valid) => changeValid(3, valid)}
          onSubmit={(config) => saveConfig("extraConfigs", config)}
        />
      );
      break;
  }

  return (
    <div className="h-full flex flex-col hide-scrollbar" style={{ height: "80vh" }}>
      <div className="grow hide-scrollbar">{stepRender}</div>

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
            disabled: !stepValids[step],
            form: FORM_IDS[step],
          },
        ]}
      />
    </div>
  );
}
