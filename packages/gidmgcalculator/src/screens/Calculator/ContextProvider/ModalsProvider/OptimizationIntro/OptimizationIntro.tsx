import { Modal } from "rond";

import { IS_DEV_ENV } from "@Src/constants";
import { selectActiveId, selectSetupManageInfos } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { useOptimizerState } from "../../hooks";

interface OptimizationIntroProps {
  active: boolean;
  setupId?: number;
  onClose: () => void;
}
export function OptimizationIntro(props: OptimizationIntroProps) {
  const { toggle } = useOptimizerState();
  const infos = useSelector(selectSetupManageInfos);
  const activeId = useSelector(selectActiveId);

  const setupId = props.setupId || activeId;
  const activeInfo = infos.find((info) => info.ID === setupId);

  const onConfirm = (testMode = false) => {
    toggle("testMode", testMode);
    toggle("active", true);
    props.onClose();
  };

  return (
    <Modal
      active={props.active}
      preset="small"
      className="bg-surface-1"
      title="Optimize"
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
      <ul className="pl-6 pr-2 list-disc space-y-2">
        <li>
          <div className="space-y-1">
            <p>
              Optimize <span className="text-primary-1">{activeInfo?.name}</span>
            </p>
            <p className="text-sm">
              The Optimizer will use every configuration of this Setup except the main character's Artifacts and
              Artifact buffs & debuffs.
            </p>
          </div>
        </li>
      </ul>
    </Modal>
  );
}
