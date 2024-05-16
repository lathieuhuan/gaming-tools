import { CharacterCalc, CalculationFinalResult } from "@Backend";

import type { Party } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { useTranslation } from "@Src/hooks";
import { FinalResultLayout, type FinalResultLayoutProps } from "./FinalResultLayout";

interface FinalResultViewProps
  extends Pick<FinalResultLayoutProps, "char" | "appChar" | "weapon" | "talentMutable" | "onChangeTalentLevel"> {
  finalResult: CalculationFinalResult;
  party: Party;
}
export function FinalResultView({ finalResult, party, ...props }: FinalResultViewProps) {
  const { t } = useTranslation();

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
        const result = finalResult[mainKey][subKey];
        let title: string | undefined;

        if (result.type === "attack") {
          const elmt = result.attElmt === "phys" ? "physical" : result.attElmt;
          const patt = result.attPatt !== "none" ? ` / ${t(result.attPatt).toLowerCase()}` : "";
          title = `${elmt}${patt}`;
        }

        return {
          title,
          cells: [
            {
              value: result.nonCrit,
              className: "text-right",
            },
            {
              value: result.crit,
              className: "text-right",
            },
            {
              value: result.average,
              className: "text-right text-primary-1",
            },
          ],
        };
      }}
    />
  );
}
