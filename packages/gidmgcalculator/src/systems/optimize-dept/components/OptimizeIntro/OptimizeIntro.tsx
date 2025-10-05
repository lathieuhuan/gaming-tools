import { useRef, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Checkbox, CollapseSpace, Select } from "rond";

import type { CalcSetup, CalcSetupManageInfo } from "@/types";

import { IS_DEV_ENV } from "@/constants";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import Object_ from "@/utils/Object";

const FORM_ID = "optimizer-preconfig";

export type OptimizeIntroProps = {
  onSubmit: (setup: CalcSetup, manageInfo: CalcSetupManageInfo, testMode: boolean) => void;
};

function OptimizeIntro(props: OptimizeIntroProps) {
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

  const [activeIntro, setActiveIntro] = useState(false);

  const onSubmit = () => {
    const info = selectedInfo.current;

    if (info) {
      props.onSubmit(Object_.clone(snapshot.setupsById[info.ID]), { ...info }, testMode.current);
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
          className={`flex items-center gap-2 ${activeIntro ? "text-active" : "text-light-hint"}`}
          onClick={() => setActiveIntro(!activeIntro)}
        >
          <FaInfoCircle className="text-lg" />
          <span>Setup Optimizer 1.0</span>
        </button>
      </div>

      <CollapseSpace active={activeIntro}>
        <div className="px-1 py-2">
          <ul className="text-sm list-disc pl-4 space-y-1">
            <li>
              The Optimizer uses every configuration of the selected Setup except the main character's Artifacts and
              their Artifact buffs & debuffs.
            </li>
            <li>Users select Artifacts in "My Artifacts" to be used instead.</li>
            <li>
              The result contains a maximum of 3 Artifact combinations that lead to the highest average value of the
              selected output. They can be loaded to the Calculator with all configurations of the selected Setup.
            </li>
          </ul>
        </div>
      </CollapseSpace>
    </div>
  );
}

OptimizeIntro.FORM_ID = FORM_ID;

export { OptimizeIntro };
