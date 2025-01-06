import { useRef, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Checkbox, CollapseSpace, Select } from "rond";

import type { CalcSetupManageInfo } from "@Src/types";
import { IS_DEV_ENV } from "@Src/constants";
import { useStoreSnapshot } from "@Src/features";
import Object_ from "@Src/utils/object-utils";
import { useOptimizerState } from "../../hooks";

const FORM_ID = "optimizer-preconfig";

interface OptimizationIntroProps {
  onClose: () => void;
}
function OptimizationIntro(props: OptimizationIntroProps) {
  //
  const snapshot = useStoreSnapshot(({ calculator }) => {
    return {
      options: calculator.setupManageInfos.map((info) => ({
        label: info.name,
        value: info.ID,
        data: info,
      })),
      activeInfo: calculator.setupManageInfos.find((info) => info.ID === calculator.activeId),
      setupsById: calculator.setupsById,
    };
  });
  const selectedInfo = useRef<CalcSetupManageInfo | undefined>(snapshot.activeInfo);
  const testMode = useRef(false);
  const { open } = useOptimizerState();

  const [activeIntro, setActiveIntro] = useState(false);

  const onSubmit = () => {
    const info = selectedInfo.current;
    const setup = info ? snapshot.setupsById[info.ID] : undefined;

    if (setup) {
      const optimizedSetup = Object.assign(Object_.clone(setup), info);

      open(optimizedSetup, testMode.current);
      props.onClose();
    }
  };

  return (
    <div>
      <form
        id={FORM_ID}
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex items-center gap-2">
          <span>Optimize</span>
          <Select
            className="font-semibold"
            defaultValue={snapshot.activeInfo?.ID}
            options={snapshot.options}
            onChange={(_, option) => (selectedInfo.current = option.data)}
          />
        </div>

        {IS_DEV_ENV && (
          <div>
            <Checkbox onChange={(checked) => (testMode.current = checked)}>Test Mode</Checkbox>
          </div>
        )}
      </form>

      <div className="mt-6">
        <button
          className={`flex items-center gap-2 ${activeIntro ? "text-active-color" : "text-hint-color"}`}
          onClick={() => setActiveIntro(!activeIntro)}
        >
          <FaInfoCircle className="text-lg" />
          <span>About Setup Optimizer 1.0</span>
        </button>
      </div>

      <CollapseSpace active={activeIntro}>
        <div className="px-1 py-2">
          <ul className="text-sm list-disc pl-4 space-y-1">
            <li>
              The Optimizer uses every configuration of the selected Setup except the main character's Artifacts and
              their Artifact buffs & debuffs.
            </li>
            <li>The Artifacts in "My Artifacts" will be used instead.</li>
            <li>
              The result contains a maximum of 3 Artifact combinations that lead to the highest average value of the
              selected output.
            </li>
          </ul>
        </div>
      </CollapseSpace>
    </div>
  );
}

OptimizationIntro.FORM_ID = FORM_ID;

export { OptimizationIntro };
