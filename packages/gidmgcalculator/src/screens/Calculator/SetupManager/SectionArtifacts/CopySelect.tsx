import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { copyArtifacts } from "@Store/calculator/actions";

import { CopySection } from "../../components/CopySection";

type Option = {
  value: number;
  label: string;
};

export function CopySelect() {
  const { setupManagers, setupsById } = useShallowCalcStore((state) =>
    Object_.pickProps(state, ["setupManagers", "setupsById"])
  );

  const copyOptions = setupManagers.reduce<Option[]>((results, manager) => {
    const { pieces } = setupsById[manager.ID].main.atfGear;

    if (Array.from(pieces).length) {
      results.push({
        label: manager.name,
        value: manager.ID,
      });
    }

    return results;
  }, []);

  return (
    copyOptions.length !== 0 && (
      <CopySection
        className="mb-4 px-4"
        options={copyOptions}
        onClickCopy={({ value }) => copyArtifacts(value)}
      />
    )
  );
}
