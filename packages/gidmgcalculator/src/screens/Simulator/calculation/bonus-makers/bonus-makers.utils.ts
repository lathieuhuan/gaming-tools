import { ELEMENT_TYPES } from "@Backend";
import { AppliedBonus } from "@Src/backend/bonus-getters";
import { ECalcStatModule } from "@Src/backend/constants/internal";
import { AttributeStat, EntityBonus, EntityBuff, WithBonusTargets } from "@Src/backend/types";
import { CalculationInfo } from "@Src/backend/utils";
import { SimulationAttackBonus, SimulationAttributeBonus } from "@Src/types";
import { toArray } from "@Src/utils";

type Bonus = WithBonusTargets<EntityBonus<unknown>>;

export function makeBonuses<T extends Bonus>(
  mod: Pick<EntityBuff<T>, "effects">,
  info: CalculationInfo,
  inputs: number[],
  getBonus: (effect: T, type: "ALL" | "STABLE", inputs: number[]) => AppliedBonus
): {
  attributeBonus: SimulationAttributeBonus[];
  attackBonus: SimulationAttackBonus[];
} {
  if (!mod.effects) {
    return {
      attributeBonus: [],
      attackBonus: [],
    };
  }

  const trigger = {
    character: "",
    src: "",
  };

  const attributeBonus: SimulationAttributeBonus[] = [];
  const attackBonus: SimulationAttackBonus[] = [];

  for (const effect of toArray(mod.effects)) {
    const totalAttrType =
      Array.isArray(effect.targets) || effect.targets.module !== ECalcStatModule.ATTR ? "ALL" : "STABLE";
    const { value, isStable } = getBonus(effect, totalAttrType, inputs);

    for (const target of toArray(effect.targets)) {
      switch (target.module) {
        case ECalcStatModule.ATTR:
          for (const targetPath of toArray(target.path)) {
            let path: AttributeStat;

            switch (targetPath) {
              case "INP_ELMT": {
                const elmtIndex = inputs[target.inpIndex ?? 0];
                path = ELEMENT_TYPES[elmtIndex];
                break;
              }
              case "OWN_ELMT":
                path = info.appChar.vision;
                break;
              default:
                path = targetPath;
            }

            attributeBonus.push({
              toStat: path,
              value,
              stable: isStable,
              trigger,
            });
          }
          break;
        case "ELMT_NA":
          for (const elmt of ELEMENT_TYPES) {
            attackBonus.push({
              toType: `NA.${elmt}`,
              toKey: target.path,
              value,
              trigger,
            });
          }
          break;
        default:
          for (const module of toArray(target.module)) {
            attackBonus.push({
              toType: module,
              toKey: target.path,
              value,
              trigger,
            });
          }
      }
    }
  }

  return {
    attributeBonus,
    attackBonus,
  };
}
