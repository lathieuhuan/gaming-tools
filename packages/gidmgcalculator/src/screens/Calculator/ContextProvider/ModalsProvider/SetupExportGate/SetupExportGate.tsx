import { SetupExporter } from "@/components";
import { useShallowCalcStore } from "@Store/calculator";

type SetupExportGateProps = {
  setupId: number;
  onClose: () => void;
};

export function SetupExportGate({ setupId, onClose }: SetupExportGateProps) {
  const { setupName, calcSetup } = useShallowCalcStore((state) => {
    return {
      setupName: state.setupManagers.find((info) => info.ID === setupId)?.name || "",
      calcSetup: state.setupsById[setupId],
    };
  });

  return <SetupExporter setupName={setupName} calcSetup={calcSetup} onClose={onClose} />;
}
