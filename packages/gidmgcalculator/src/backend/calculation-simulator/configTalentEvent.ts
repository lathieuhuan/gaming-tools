import type { SimulationTarget } from "@Src/types";
import { pickProps } from "@Src/utils";
import { CalculationInfo } from "@Src/backend/utils";
import { ResistanceReductionControl, TotalAttribute } from "@Src/backend/controls";
import { AttackPatternConfArgs, CalcItemCalculator, CalcItemConfig } from "@Src/backend/calculation";

type ConfigTalentEventArgs = Pick<AttackPatternConfArgs, "attBonus"> & {
  itemConfig: CalcItemConfig;
  level: number;
  totalAttr: TotalAttribute;
  info: CalculationInfo;
  target: SimulationTarget;
};

export function configTalentEvent(args: ConfigTalentEventArgs) {
  const { itemConfig, totalAttr, info, target } = args;

  const resistances = new ResistanceReductionControl().apply(target);

  const calculateCalcItem = CalcItemCalculator(info.char.level, target.level, totalAttr, resistances);

  const base = itemConfig.calculateBaseDamage(args.level);

  const result = calculateCalcItem({
    base,
    ...itemConfig,
  });

  return {
    damage: result.average,
    ...pickProps(itemConfig, ["attElmt", "attPatt", "record"]),
  };
}
