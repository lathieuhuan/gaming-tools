import type {
  ArtifactBonusCore,
  AttributeStat,
  CharacterBonusCore,
  EntityBonusBasedOn,
  WeaponBonusCore,
} from "@Src/backend/types";
import type { GetTotalAttributeType, TotalAttributeControl } from "@Src/backend/controls";
import type {
  AppliedBonuses,
  ApplyArtifactBuffArgs,
  ApplyCharacterBuffArgs,
  ApplyEffectBonuses,
  ApplyWeaponBuffArgs,
  GetAppliedBonuses,
  IsStackableAppliedBonus,
} from "./appliers.types";

import { ELEMENT_TYPES } from "@Src/backend/constants";
import { ECalcStatModule } from "@Src/backend/constants/internal";
import { toArray } from "@Src/utils";
import { CalculationInfo, EntityCalc } from "@Src/backend/utils";
import { ModifierStackingControl } from "@Src/backend/controls";
import { getCharacterBareBonus, getWeaponBareBonus, getArtifactBareBonus } from "@Src/backend/bonus-getters";

export class BuffApplierCore {
  private modStackingCtrl = new ModifierStackingControl();

  constructor(protected calcInfo: CalculationInfo, protected totalAttrCtrl: TotalAttributeControl) {}

  private applyEffectBonuses: ApplyEffectBonuses = (args) => {
    const { bonus, isStackable, description } = args;
    if (!bonus.value) return;

    for (const target of toArray(args.targets)) {
      if (isStackable && target.module.slice(0, 2) !== "id" && !isStackable(target.path)) {
        continue;
      }

      switch (target.module) {
        case ECalcStatModule.ATTR: {
          for (const targetPath of toArray(target.path)) {
            let toStat: AttributeStat;

            switch (targetPath) {
              case "INP_ELMT": {
                const elmtIndex = args.inputs[target.inpIndex ?? 0];
                toStat = ELEMENT_TYPES[elmtIndex];
                break;
              }
              case "OWN_ELMT":
                toStat = args.vision;
                break;
              default:
                toStat = targetPath;
            }

            args.applyAttrBonus({
              ...bonus,
              toStat,
              description,
            });
          }
          break;
        }
        case "ELMT_NA":
          for (const elmt of ELEMENT_TYPES) {
            args.applyAttkBonus({
              id: bonus.id,
              toType: `NA.${elmt}`,
              toKey: target.path,
              value: bonus.value,
              description,
            });
          }
          break;
        default:
          for (const module of toArray(target.module)) {
            args.applyAttkBonus({
              id: bonus.id,
              toType: module,
              toKey: target.path,
              value: bonus.value,
              description,
            });
          }
      }
    }
  };

  private getAppliedBonuses: GetAppliedBonuses = (args) => {
    const { buff, fromSelf = false, isFinal, getBareBonus, ...applyArgs } = args;
    const result: AppliedBonuses = {
      attrBonuses: [],
      attkBonuses: [],
    };
    if (!buff.effects) return result;

    const isStackable: IsStackableAppliedBonus = (paths) => {
      return this.modStackingCtrl?.isStackable({ trackId: buff.trackId, paths }) ?? true;
    };

    for (const config of toArray(buff.effects)) {
      if (
        (isFinal === undefined || isFinal === isTrulyFinalBonus(config)) &&
        EntityCalc.isApplicableEffect(config, this.calcInfo, args.inputs, fromSelf)
      ) {
        const totalAttrType: GetTotalAttributeType =
          Array.isArray(config.targets) || config.targets.module !== ECalcStatModule.ATTR ? "ALL" : "STABLE";

        const bonus = getBareBonus({
          config,
          getTotalAttrFromSelf: (stat) => this.totalAttrCtrl.getTotal(stat, totalAttrType),
        });

        this.applyEffectBonuses({
          ...applyArgs,
          bonus,
          vision: this.calcInfo.appChar.vision,
          targets: config.targets,
          isStackable,
          applyAttrBonus: (bonus) => {
            result.attrBonuses.push(bonus);
          },
          applyAttkBonus: (bonus) => {
            result.attkBonuses.push(bonus);
          },
        });
      }
    }
    return result;
  };

  protected getAppliedCharacterBonuses = (args: ApplyCharacterBuffArgs) => {
    const { fromSelf = false } = args;

    return this.getAppliedBonuses({
      ...args,
      getBareBonus: (getArgs) => {
        return getCharacterBareBonus({
          ...getArgs,
          inputs: args.inputs,
          fromSelf,
          info: this.calcInfo,
        });
      },
    });
  };

  protected getApplyWeaponBonuses = (args: ApplyWeaponBuffArgs) => {
    const { fromSelf = false } = args;

    return this.getAppliedBonuses({
      ...args,
      getBareBonus: (getArgs) => {
        return getWeaponBareBonus({
          ...getArgs,
          refi: args.refi,
          inputs: args.inputs,
          fromSelf,
          info: this.calcInfo,
        });
      },
    });
  };

  protected getApplyArtifactBonuses = (args: ApplyArtifactBuffArgs) => {
    const { fromSelf = false } = args;

    return this.getAppliedBonuses({
      ...args,
      getBareBonus: (getArgs) => {
        return getArtifactBareBonus({
          ...getArgs,
          inputs: args.inputs,
          fromSelf,
          info: this.calcInfo,
        });
      },
    });
  };
}

function isFinalBonus(basedOn?: EntityBonusBasedOn) {
  if (basedOn) {
    const field = typeof basedOn === "string" ? basedOn : basedOn.field;
    return field !== "base_atk";
  }
  return false;
}

function isTrulyFinalBonus(bonus: CharacterBonusCore | WeaponBonusCore | ArtifactBonusCore) {
  return (
    isFinalBonus(bonus.basedOn) ||
    (typeof bonus.preExtra === "object" && isFinalBonus(bonus.preExtra.basedOn)) ||
    (typeof bonus.sufExtra === "object" && isFinalBonus(bonus.sufExtra.basedOn))
  );
}
