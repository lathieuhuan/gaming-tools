import { SetupExporter } from "@Src/components";
import { useStoreSnapshot } from "@Src/features";
import Setup_ from "@Src/utils/setup-utils";

type SetupExportGateProps = {
  setupId: number;
  onClose: () => void;
};

export function SetupExportGate({ setupId, onClose }: SetupExportGateProps) {
  const calculator = useStoreSnapshot((state) => state.calculator);
  const setup = calculator.setupsById[setupId];
  const setupName = calculator.setupManageInfos.find((info) => info.ID === setupId)?.name || "";

  return (
    <SetupExporter
      setupName={setupName}
      calcSetup={{
        ...Setup_.cleanupCalcSetup(setup, calculator.target),
        weapon: setup.weapon,
        artifacts: setup.artifacts,
      }}
      target={calculator.target}
      onClose={onClose}
    />
  );
}
