import type { CalcResultNew } from "@/logic/calculator";

import { useTranslation } from "@/hooks";
import { attackCalcItemSubtitleParts, DEFAULT_RESULT_ITEM, displayResultItem } from "./utils";

import { FinalResultLayout, type FinalResultLayoutProps } from "./FinalResultLayout";

type FinalResultViewProps = Pick<
  FinalResultLayoutProps,
  "character" | "talentMutable" | "onTalentLevelChange" | "extraKeys"
> & {
  calcResult: CalcResultNew;
};

export function FinalResultView({ calcResult, ...props }: FinalResultViewProps) {
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
        const result = calcResult[mainKey].get(subKey);
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
          case "healing":
          case "shield":
          case "other":
            // No title for healing, shield, and other
            break;
          default: {
            result satisfies undefined;
          }
        }

        const values = result ? displayResultItem(result) : DEFAULT_RESULT_ITEM;

        return {
          title,
          cells: [
            {
              value: values.base,
              className: "text-right",
            },
            {
              value: values.crit,
              className: "text-right",
            },
            {
              value: values.average,
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
