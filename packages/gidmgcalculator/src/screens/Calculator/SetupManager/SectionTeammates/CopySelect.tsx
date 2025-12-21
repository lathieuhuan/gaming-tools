import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { copyTeammates } from "@Store/calculator/actions";

import { CopySection } from "@/screens/Calculator/_components/CopySection";

type Option = {
  value: number;
  label: string;
};

export function CopySelect() {
  const { setupManagers, setupsById } = useShallowCalcStore((state) =>
    Object_.pickProps(state, ["setupManagers", "setupsById"])
  );

  const copyOptions = setupManagers.reduce<Option[]>((results, manager) => {
    const { teammates } = setupsById[manager.ID];

    if (teammates.length) {
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
        className="mt-3 mb-1 px-4"
        options={copyOptions}
        onClickCopy={({ value }) => copyTeammates(value)}
      />
    )
  );
}
