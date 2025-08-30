import { SetupExporter } from "@/components";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import Setup_ from "@/utils/setup-utils";

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
