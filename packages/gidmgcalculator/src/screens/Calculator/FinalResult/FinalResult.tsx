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
  const { activeSetupName, main, calcResult, comparedIds } = useShallowCalcStore((state) => {
    const setup = selectSetup(state);

    return {
      activeSetupName: state.setupManagers.find((info) => info.ID === state.activeId)?.name || "",
      main: setup.main,
      calcResult: setup.result,
      comparedIds: state.comparedIds,
    };
  });

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
          finalResult={calcResult}
          onTalentLevelChange={(type, level) => updateMain({ [type]: level })}
        />
      </div>
    </div>
  );
}
