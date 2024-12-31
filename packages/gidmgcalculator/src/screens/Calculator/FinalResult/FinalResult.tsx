import type { RootState } from "@Store/store";

import Array_ from "@Src/utils/array-utils";
import {
  selectCalcFinalResult,
  selectCharacter,
  selectComparedIds,
  selectParty,
  selectWeapon,
  updateCharacter,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { useCharacterData } from "../ContextProvider";

// Components
import { FinalResultView } from "@Src/components";
import { FinalResultCompare } from "./FinalResultCompare";
import { Menu } from "./Menu";

export function FinalResult() {
  return (
    <div className="h-full">
      <Menu />
      <FinalResultCore />
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
  const char = useSelector(selectCharacter);
  const weapon = useSelector(selectWeapon);
  const party = useSelector(selectParty);
  const finalResult = useSelector(selectCalcFinalResult);
  const comparedIds = useSelector(selectComparedIds);
  const appChar = useCharacterData();

  if (comparedIds.length > 1) {
    return <FinalResultCompare comparedIds={comparedIds} {...{ char, weapon, party }} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 mb-2 shrink-0">
        <p className="font-bold text-center truncate">{activeSetupName}</p>
      </div>
      <div className="grow hide-scrollbar">
        <FinalResultView
          {...{ char, weapon, party, finalResult, appChar }}
          talentMutable
          onChangeTalentLevel={(type, level) => dispatch(updateCharacter({ [type]: level }))}
        />
      </div>
    </div>
  );
}
