import { useRef, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { CollapseSpace, Modal, Select } from "rond";

import { IS_DEV_ENV } from "@Src/constants";
import { useStore } from "@Src/features";
import Object_ from "@Src/utils/object-utils";
import { selectActiveId, selectSetupManageInfos } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { useOptimizerState } from "../../hooks";

interface IntroCoreProps {
  setupId: number;
  onChangeSetup: (id: number) => void;
}
function IntroCore(props: IntroCoreProps) {
  const setupInfos = useSelector(selectSetupManageInfos);
  const [activeIntro, setActiveIntro] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2">
        <span>Optimize</span>
        <Select
          className="font-semibold"
          defaultValue={props.setupId}
          options={setupInfos.map((info) => ({
            label: info.name,
            value: info.ID,
          }))}
          onChange={(id) => props.onChangeSetup(id as number)}
        />
      </div>

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

interface OptimizationIntroProps {
  active: boolean;
  onClose: () => void;
}
export function OptimizationIntro(props: OptimizationIntroProps) {
  const store = useStore();
  const { setActive } = useOptimizerState();
  const activeId = useSelector(selectActiveId);
  const selectedId = useRef<number>(0);

  const onConfirm = (testMode = false) => {
    const setupId = selectedId.current || activeId;
    const setup = store.select(({ calculator }) => {
      const manageInfo = calculator.setupManageInfos.find((info) => info.ID === setupId);
      const setupInfo = Object_.clone(calculator.setupsById[setupId]);

      return manageInfo ? Object.assign(setupInfo, manageInfo) : undefined;
    });

    if (setup) {
      setActive(true, setup, testMode);
      props.onClose();
    }
  };

  return (
    <Modal
      active={props.active}
      title="Optimizer"
      preset="small"
      // centered={false}
      className="bg-surface-2"
      // style={{
      //   top: "min(20%, 5rem)",
      // }}
      withActions
      moreActions={[
        {
          children: "Test Mode",
          className: !IS_DEV_ENV && "hidden",
          onClick: () => onConfirm(true),
        },
      ]}
      confirmButtonProps={{
        children: "Proceed",
        autoFocus: true,
      }}
      onConfirm={() => onConfirm()}
      onClose={props.onClose}
    >
      <IntroCore setupId={activeId} onChangeSetup={(id) => (selectedId.current = id)} />
    </Modal>
  );
}
