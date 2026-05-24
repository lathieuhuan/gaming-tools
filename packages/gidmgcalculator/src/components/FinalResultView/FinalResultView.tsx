import type { CalcResult } from "@/calculation/calculator";
import type { CalcResultAttackItem } from "@/calculation/types";

import { LUNAR_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { LunarType } from "@/types";
import { displayValues } from "./utils";

import { FinalResultLayout, type FinalResultLayoutProps } from "./FinalResultLayout";

type FinalResultViewProps = Pick<
  FinalResultLayoutProps,
  "character" | "talentMutable" | "onTalentLevelChange" | "extraKeys"
> & {
  finalResult: CalcResult;
};

export function FinalResultView({ finalResult, ...props }: FinalResultViewProps) {
  const { t } = useTranslation();

  const tAttElmt = (attElmt: CalcResultAttackItem["attElmt"]) => {
    return LUNAR_TYPES.includes(attElmt as LunarType) ? t(attElmt) : t(`${attElmt}_attElmt`);
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

        switch (result?.type) {
          case "attack": {
            const elmt = tAttElmt(result.attElmt);
            const patt = result.attPatt !== "none" ? ` / ${t(result.attPatt).toLowerCase()}` : "";
            title = `${elmt}${patt}`;
            break;
          }
          case "reaction": {
            const elmt = tAttElmt(result.attElmt);
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
