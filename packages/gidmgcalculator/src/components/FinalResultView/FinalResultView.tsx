import { CharacterCalc, CalculationFinalResult } from "@Backend";

import type { Party } from "@Src/types";
import { FinalResultLayout, type FinalResultLayoutProps } from "./FinalResultLayout";
import { $AppCharacter } from "@Src/services";

interface FinalResultViewProps
  extends Pick<FinalResultLayoutProps, "char" | "appChar" | "weapon" | "talentMutable" | "onChangeTalentLevel"> {
  finalResult: CalculationFinalResult;
  party: Party;
}
export function FinalResultView({ finalResult, party, ...props }: FinalResultViewProps) {
  return (
    <FinalResultLayout
      {...props}
      showWeaponCalc
      headerConfigs={[
        {
          content: "Non-crit",
        },
        {
          content: "Crit",
        },
        {
          content: "Avg.",
          className: "text-primary-1",
        },
      ]}
      getTalentLevel={(talentType) => {
        return CharacterCalc.getFinalTalentLv({
          char: props.char,
          appChar: props.appChar,
          talentType,
          partyData: $AppCharacter.getPartyData(party),
        });
      }}
      getRowConfig={(mainKey, subKey) => {
        const { nonCrit, average, crit, attElmt } = finalResult[mainKey][subKey];
        return {
          element: attElmt,
          cells: [
            {
              value: nonCrit,
              className: "text-right",
            },
            {
              value: crit,
              className: "text-right",
            },
            {
              value: average,
              className: "text-right text-primary-1",
            },
          ],
        };
      }}
    />
  );
}
