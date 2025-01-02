import type { RootState } from "@Store/store";

import Array_ from "@Src/utils/array-utils";
import { selectCalcFinalResult, selectComparedIds, selectWeapon, updateCharacter } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { useCharacterData } from "../ContextProvider";

// Components
import { FinalResultView } from "@Src/components";
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

const selectActiveSetupName = (state: RootState) => {
  const { activeId, setupManageInfos } = state.calculator;
  return Array_.findById(setupManageInfos, activeId)?.name || "";
};

export function FinalResultCore() {
  const dispatch = useDispatch();
  const activeSetupName = useSelector(selectActiveSetupName);
  const weapon = useSelector(selectWeapon);
  const finalResult = useSelector(selectCalcFinalResult);
  const comparedIds = useSelector(selectComparedIds);
  const characterData = useCharacterData();

  if (comparedIds.length > 1) {
    return <FinalResultCompare {...{ characterData, weapon, comparedIds }} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 mb-2 shrink-0">
        <p className="font-bold text-center truncate">{activeSetupName}</p>
      </div>
      <div className="grow hide-scrollbar">
        <FinalResultView
          {...{ characterData, weapon, finalResult }}
          talentMutable
          onChangeTalentLevel={(type, level) => dispatch(updateCharacter({ [type]: level }))}
        />
      </div>
    </div>
  );
}
