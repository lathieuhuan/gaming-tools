import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";

import { CopySection } from "@/screens/Calculator/_components/CopySection";

type CopyOption = {
  value: number;
  label: string;
};

type CopySelectProps = {
  type: "customBuffCtrls" | "customDebuffCtrls";
};

export function CopySelect({ type }: CopySelectProps) {
  const { setupManagers, setupsById } = useShallowCalcStore((state) =>
    Object_.pickProps(state, ["setupManagers", "setupsById"])
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
    updateActiveSetup((setup) => {
      switch (type) {
        case "customBuffCtrls":
          setup.customBuffCtrls = setupsById[option.value]?.customBuffCtrls || [];
          break;
        case "customDebuffCtrls":
          setup.customDebuffCtrls = setupsById[option.value]?.customDebuffCtrls || [];
          break;
      }
    });
  };

  if (!copyOptions.length) {
    return null;
  }

  return <CopySection className="mt-6" options={copyOptions} onClickCopy={handleCopy} />;
}
