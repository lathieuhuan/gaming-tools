import type { CalcResult } from "@/calculation/calculator/types";
import type { ActualAttackElement } from "@/types";

import { useTranslation } from "@/hooks";
import { FinalResultLayout, type FinalResultLayoutProps } from "./FinalResultLayout";
import { displayValues } from "./utils";

type FinalResultViewProps = Pick<
  FinalResultLayoutProps,
  "character" | "talentMutable" | "onTalentLevelChange"
> & {
  finalResult: CalcResult;
};

export function FinalResultView({ finalResult, ...props }: FinalResultViewProps) {
  const { t } = useTranslation();

  const displayAttElmt = (attElmt: ActualAttackElement) => {
    return attElmt === "phys" ? "physical" : attElmt;
  };

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

        switch (result.type) {
          case "attack": {
            const elmt = displayAttElmt(result.attElmt);
            const patt = result.attPatt !== "none" ? ` / ${t(result.attPatt).toLowerCase()}` : "";
            title = `${elmt}${patt}`;
            break;
          }
          case "reaction": {
            const elmt = displayAttElmt(result.attElmt);
            const reaction = result.reaction ? ` / ${result.reaction}` : "";
            title = `${elmt}${reaction}`;
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
              value: displayValues(result.values, "base"),
              className: "text-right",
            },
            {
              value: displayValues(result.values, "crit"),
              className: "text-right",
            },
            {
              value: displayValues(result.values, "average"),
              className: "text-right text-primary-1",
            },
          ],
          onDoubleClick() {
            console.log(result);
          },
        };
      }}
    />
  );
}
