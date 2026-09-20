import { Button, ExclamationCircleSvg } from "rond";

import { SetupExporter } from "@/components/SetupPorters";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";

export function CalcSetupExporter({
  setupId,
  onCancel,
}: {
  setupId: number;
  onCancel: () => void;
}) {
  const calcSetup = useCalcStore((state) => selectSetup(state, setupId));

  if (!calcSetup) {
    return (
      <div className="py-4 flex flex-col items-center justify-center gap-4">
        <ExclamationCircleSvg className="text-danger-2 size-20" />
        <p className="uppercase">Setup not found</p>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    );
  }

  return <SetupExporter calcSetup={calcSetup} onCancel={onCancel} />;
}
