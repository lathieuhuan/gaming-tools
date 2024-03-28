import type { Character, CalculationFinalResult, Party, Weapon } from "@Src/types";
import { FinalResultLayout } from "./FinalResultLayout";

interface FinalResultViewProps {
  char: Character;
  weapon: Weapon;
  party: Party;
  finalResult: CalculationFinalResult;
  talentMutable?: boolean;
  onChangeTalentLevel?: (newLevel: number) => void;
}
export function FinalResultView({ finalResult, talentMutable, onChangeTalentLevel, ...rest }: FinalResultViewProps) {
  return (
    <FinalResultLayout
      {...rest}
      showWeaponCalc
      headerConfigs={[
        null,
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
