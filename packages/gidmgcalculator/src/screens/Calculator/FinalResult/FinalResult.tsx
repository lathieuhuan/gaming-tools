import { useMemo } from "react";

import { useShallowCalcStore } from "@Store/calculator";
import { updateMain } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";

// Components
import { FinalResultView } from "@/components";
import { FinalResultCompare } from "./FinalResultCompare";
import { Menu } from "./Menu";

export function FinalResult() {
  const calcResultRender = <FinalResultCore />;

  return (
    <div className="h-full">
      <Menu calcResultRender={calcResultRender} />
      {calcResultRender}
    </div>
  );
}

export function FinalResultCore() {
  const { activeSetupName, main, calcItems, calcResult, comparedIds } = useShallowCalcStore(
    (state) => {
      const setup = selectSetup(state);

      return {
        activeSetupName: state.setupManagers.find((info) => info.ID === state.activeId)?.name || "",
        main: setup.main,
        calcItems: setup.calcItems,
        calcResult: setup.result,
        comparedIds: state.comparedIds,
      };
    }
  );

  const extraKeys = useMemo(() => {
    return calcItems.map((item) => item.name);
  }, [calcItems]);

  if (comparedIds.length > 1) {
    return <FinalResultCompare comparedIds={comparedIds} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 mb-2 shrink-0">
        <p className="font-bold text-center truncate">{activeSetupName}</p>
      </div>
      <div className="grow hide-scrollbar">
        <FinalResultView
          talentMutable
          character={main}
          extraKeys={extraKeys}
          finalResult={calcResult}
          onTalentLevelChange={(type, level) => updateMain({ [type]: level })}
        />
      </div>
    </div>
  );
}
