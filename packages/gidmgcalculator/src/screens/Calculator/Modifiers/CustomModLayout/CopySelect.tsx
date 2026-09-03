import { Object_ } from "ron-utils";

import { useShallowCalcStore } from "@Store/calculator";
import { updateSetup } from "@Store/calculator/actions";

import { CopySection } from "@/screens/Calculator/components/CopySection";

type CopyOption = {
  value: number;
  label: string;
};

type CopySelectProps = {
  type: "customBuffCtrls" | "customDebuffCtrls";
};

export function CopySelect({ type }: CopySelectProps) {
  const { setupManagers, setupsById } = useShallowCalcStore((state) =>
    Object_.extract(state, ["setupManagers", "setupsById"]),
  );

  const copyOptions: CopyOption[] = [];

  for (const { ID, name } of setupManagers) {
    if (setupsById[ID][type].length) {
      copyOptions.push({
        label: name,
        value: ID,
      });
    }
  }

  const handleCopy = (option: CopyOption) => {
    updateSetup((setup) => {
      switch (type) {
        case "customBuffCtrls":
          setup.customBuffCtrls = setupsById[option.value]?.customBuffCtrls || [];
          break;
        case "customDebuffCtrls":
          setup.customDebuffCtrls = setupsById[option.value]?.customDebuffCtrls || [];
          break;
        default:
          return false;
      }
    });
  };

  if (!copyOptions.length) {
    return null;
  }

  return <CopySection className="mt-6" options={copyOptions} onClickCopy={handleCopy} />;
}
