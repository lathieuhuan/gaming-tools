import type { CalcResult } from "@/logic/calculator";

import { useTranslation } from "@/hooks";
import { attackCalcItemSubtitleParts, displayValues } from "./utils";

import { FinalResultLayout, type FinalResultLayoutProps } from "./FinalResultLayout";

type FinalResultViewProps = Pick<
  FinalResultLayoutProps,
  "character" | "talentMutable" | "onTalentLevelChange" | "extraKeys"
> & {
  finalResult: CalcResult;
};

export function FinalResultView({ finalResult, ...props }: FinalResultViewProps) {
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
      getRowConfig={(mainKey, subKey) => {
        const result = finalResult[mainKey][subKey];
        let title: string | undefined;

        switch (result?.type) {
          case "attack": {
            const parts = attackCalcItemSubtitleParts(result).map((part) => t(part));

            title = parts.join(" / ");
            break;
          }
          case "reaction": {
            title = t(`${result.attElmt}_attElmt`);
            break;
          }
          default: {
            break;
          }
        }

        return {
          title,
          cells: [
            {
              value: displayValues(result?.values, "base"),
              className: "text-right",
            },
            {
              value: displayValues(result?.values, "crit"),
              className: "text-right",
            },
            {
              value: displayValues(result?.values, "average"),
              className: "text-right text-primary-1",
            },
          ],
          onDoubleClick() {
            console.info(result);
          },
        };
      }}
    />
  );
}
