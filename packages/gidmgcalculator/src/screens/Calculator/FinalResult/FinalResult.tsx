import { useShallowCalcStore } from "@Store/calculator";
import { updateCharacter } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";

// Components
import { FinalResultView } from "@/components";
import { FinalResultCompare } from "./FinalResultCompare";
import { Menu } from "./Menu";

export function FinalResult() {
  const finalResultRender = <FinalResultCore />;

  return (
    <div className="h-full">
      <Menu finalResult={finalResultRender} />
      {finalResultRender}
    </div>
  );
}

export function FinalResultCore() {
  const { activeSetupName, character, finalResult, comparedIds } = useShallowCalcStore((state) => {
    const setup = selectSetup(state);

    return {
      activeSetupName: state.setupManagers.find((info) => info.ID === state.activeId)?.name || "",
      character: setup.char,
      finalResult: setup.result,
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
          character={character}
          finalResult={finalResult}
          onTalentLevelChange={(type, level) => updateCharacter({ [type]: level })}
        />
      </div>
    </div>
  );
}
