import { findById } from "@Src/utils";
import {
  selectCalcFinalResult,
  selectCharacter,
  selectComparedIds,
  selectParty,
  selectWeapon,
  updateCharacter,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

import { FinalResultView } from "@Src/components";
import { FinalResultCompare } from "./FinalResultCompare";
import { $AppCharacter } from "@Src/services";

export function FinalResultCore() {
  const dispatch = useDispatch();
  const activeSetupName = useSelector((state) => {
    const { activeId, setupManageInfos } = state.calculator;
    return findById(setupManageInfos, activeId)?.name || "";
  });
  const char = useSelector(selectCharacter);
  const weapon = useSelector(selectWeapon);
  const party = useSelector(selectParty);
  const finalResult = useSelector(selectCalcFinalResult);
  const comparedIds = useSelector(selectComparedIds);

  if (comparedIds.length > 1) {
    return <FinalResultCompare comparedIds={comparedIds} {...{ char, weapon, party }} />;
  }

  const appChar = $AppCharacter.get(char.name);

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
