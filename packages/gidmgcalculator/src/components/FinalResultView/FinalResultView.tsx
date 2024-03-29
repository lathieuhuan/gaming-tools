import type { Character, CalculationFinalResult, Party, Weapon } from "@Src/types";
import { FinalResultLayout, type FinalResultLayoutProps } from "./FinalResultLayout";

interface FinalResultViewProps extends Pick<FinalResultLayoutProps, "talentMutable" | "onChangeTalentLevel"> {
  char: Character;
  weapon: Weapon;
  party: Party;
  finalResult: CalculationFinalResult;
}
export function FinalResultView({ finalResult, ...rest }: FinalResultViewProps) {
  return (
    <FinalResultLayout
      {...rest}
      showWeaponCalc
      headerConfigs={[
        {
          text: "Non-crit",
        },
        {
          text: "Crit",
        },
        {
          text: "Avg.",
          className: "text-primary-1",
        },
      ]}
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
