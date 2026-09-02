import { Object_ } from "ron-utils";

import type { CalcSetup } from "@/logic/calculator";

import { useShallowCalcStore } from "@Store/calculator";
import { updateSetup } from "@Store/calculator/actions";

import { CopySection } from "@/screens/Calculator/components/CopySection";

type Option = {
  value: number;
  label: string;
  data: CalcSetup;
};

export function CopySelect() {
  const { setupManagers, setupsById } = useShallowCalcStore((state) =>
    Object_.extract(state, ["setupManagers", "setupsById"]),
  );

  const copyOptions = setupManagers.reduce<Option[]>((results, manager) => {
    const setup = setupsById[manager.ID];

    if (setup.main.atfGear.list().length) {
      results.push({
        label: manager.name,
        value: manager.ID,
        data: setup,
      });
    }

    return results;
  }, []);

  const handleCopy = (sourceSetup: CalcSetup) => {
    updateSetup((setup) => {
      setup.copyArtifacts(sourceSetup);
    });
  };

  return (
    copyOptions.length !== 0 && (
      <CopySection
        className="mb-4 px-4"
        options={copyOptions}
        onClickCopy={({ data }) => handleCopy(data)}
      />
    )
  );
}
