import { CalculationFinalResult } from "@Backend";

import type { UICharacterRecord } from "@Src/utils/ui-character-record";
import { useTranslation } from "@Src/hooks";
import { FinalResultLayout, type FinalResultLayoutProps } from "./FinalResultLayout";

interface FinalResultViewProps
  extends Pick<FinalResultLayoutProps, "weapon" | "talentMutable" | "onChangeTalentLevel"> {
  record: UICharacterRecord;
  finalResult: CalculationFinalResult;
}
export function FinalResultView({ record, finalResult, ...props }: FinalResultViewProps) {
  const { t } = useTranslation();

  return (
    <FinalResultLayout
      {...props}
      appCharacter={record.appCharacter}
      getTalentLevel={record.getFinalTalentLv}
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
