import { useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { ButtonGroup, SwitchNode } from "rond";

import { StepArtifactSetSelect } from "./StepArtifactSetSelect";
import { SelectedCalcItem, StepCalcItemSelect } from "./StepCalcItemSelect";

type SavedConfig = {
  calcItem: SelectedCalcItem;
  artifactCodes: number[];
};

export function Optimizer() {
  const savedConfig = useRef<Partial<SavedConfig>>({});
  const [step, setStep] = useState(0);
  const [stepValids, setStepValids] = useState<boolean[]>([]);

  const FORM_IDS = ["calc-item", "artifact-set"];

  const navigateStep = (stepDiff: number) => {
    const newStep = step + stepDiff;

    if (newStep > 1) {
      console.log("complete");
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
                  id={FORM_IDS[0]}
                  initialValue={savedConfig.current?.calcItem}
                  onChangeValid={(valid) => changeValid(0, valid)}
                  onSubmit={(calcItem) => saveConfig("calcItem", calcItem)}
                />
              ),
            },
            {
              value: 1,
              element: (
                <StepArtifactSetSelect
                  id={FORM_IDS[1]}
                  initialValue={savedConfig.current?.artifactCodes}
                  onChangeValid={(valid) => changeValid(1, valid)}
                  onSubmit={(codes) => saveConfig("artifactCodes", codes)}
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
            disabled: !stepValids[step],
            form: FORM_IDS[step],
          },
        ]}
      />
    </div>
  );
}
