import { useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { ButtonGroup } from "rond";

import type { ArtifactFilterSet } from "@Src/components/ArtifactFilter/hooks";
import Modifier_ from "@Src/utils/modifier-utils";
import { ArtifactBuffConfig, StepArtifactModConfig } from "./StepArtifactModConfig";
import { StepArtifactSetSelect } from "./StepArtifactSetSelect";
import { SelectedCalcItem, StepCalcItemSelect } from "./StepCalcItemSelect";
import { OptimizerExtraConfig, StepExtraConfigs } from "./StepExtraConfigs";

type SavedConfig = {
  calcItem: SelectedCalcItem;
  sets: ArtifactFilterSet[];
  buffs: ArtifactBuffConfig;
  extra: OptimizerExtraConfig;
};

export function Optimizer() {
  const savedConfig = useRef<Partial<SavedConfig>>({});
  const [step, setStep] = useState(0);
  const [stepValids, setStepValids] = useState<boolean[]>([false, false, true, true]);

  const FORM_IDS = ["calc-item", "artifact-set", "artifact-modifier", "extra-config"];
  const currentFormId = FORM_IDS[step];

  const navigateStep = (stepDiff: number) => {
    const newStep = step + stepDiff;

    if (newStep >= FORM_IDS.length) {
      console.log("complete");
      console.log(savedConfig.current);
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

  const saveConfig = <TKey extends keyof SavedConfig>(key: TKey, value: SavedConfig[TKey]) => {
    savedConfig.current[key] = value;
    navigateStep(1);
  };

  const onSubmitArtifactSets = (sets: ArtifactFilterSet[]) => {
    saveConfig("sets", sets);

    const newBuffConfigs = {
      ...savedConfig.current.buffs,
    };

    for (const { code, data } of sets) {
      if (!newBuffConfigs[code] && data.buffs) {
        newBuffConfigs[code] = data.buffs.map<ArtifactBuffConfig[number][number]>((buff) => ({
          index: buff.index,
          activated: true,
          inputs: Modifier_.createModCtrlInpus(buff.inputConfigs, true),
        }));
      }
    }

    savedConfig.current.buffs = newBuffConfigs;
  };

  let stepRender: React.ReactNode;

  switch (step) {
    case 0:
      stepRender = (
        <StepCalcItemSelect
          id={currentFormId}
          initialValue={savedConfig.current?.calcItem}
          onChangeValid={(valid) => changeValid(0, valid)}
          onSubmit={(calcItem) => saveConfig("calcItem", calcItem)}
        />
      );
      break;
    case 1: {
      stepRender = (
        <StepArtifactSetSelect
          id={currentFormId}
          initialValue={savedConfig.current?.sets?.map((set) => set.code)}
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
            buffs: savedConfig.current.buffs,
          }}
          artifactSets={savedConfig.current.sets}
          onChangeValid={(valid) => changeValid(2, valid)}
          onSubmit={(config) => saveConfig("buffs", config)}
        />
      );
      break;
    }
    case 3:
      stepRender = (
        <StepExtraConfigs
          id={currentFormId}
          initialValue={savedConfig.current.extra}
          onChangeValid={(valid) => changeValid(3, valid)}
          onSubmit={(config) => saveConfig("extra", config)}
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
