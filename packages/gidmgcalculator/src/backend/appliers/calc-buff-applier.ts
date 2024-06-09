import type { CalculationInfo } from "@Src/backend/utils";
import type { ApplyBonusesArgs, BonusConfig } from "./appliers.types";
import type { ArtifactBonusCore, CharacterBonusCore, WeaponBonusCore, WithBonusTargets } from "@Src/backend/types";

import { getArtifactBonus, getCharacterBonus, getWeaponBonus } from "@Src/backend/bonus-getters";
import { AttackBonusControl, ModifierStackingControl, TotalAttributeControl } from "@Src/backend/controls";
import { BuffApplierCore } from "./buff-applier-core";

type ApplyBuffArgs<T extends BonusConfig> = Omit<ApplyBonusesArgs<WithBonusTargets<T>>, "getBonus">;

export class CalcBuffApplier extends BuffApplierCore {
  constructor(
    info: CalculationInfo,
    totalAttr: TotalAttributeControl,
    attackBonus: AttackBonusControl,
    modStackingCtrl: ModifierStackingControl
  ) {
    super(
      info,
      (bonus) => {
        const add = bonus.stable ? totalAttr.addStable : totalAttr.addUnstable;
        add(bonus.keys, bonus.value, bonus.description);
      },
      (bonus) => {
        attackBonus.add(bonus.module, bonus.path, bonus.value, bonus.description);
      },
      totalAttr,
      modStackingCtrl
    );
  }

  applyCharacterBuff = (args: ApplyBuffArgs<CharacterBonusCore>) => {
    const { fromSelf = false } = args;

    this.applyBonuses({
      ...args,
      getBonus: (getArgs) => {
        return getCharacterBonus({
          ...getArgs,
          inputs: args.inputs,
          fromSelf,
          info: this.info,
        });
      },
    });
  };

  applyWeaponBuff = (args: ApplyBuffArgs<WeaponBonusCore> & { refi: number }) => {
    const { fromSelf = false } = args;

    this.applyBonuses({
      ...args,
      getBonus: (getArgs) => {
        return getWeaponBonus({
          ...getArgs,
          refi: args.refi,
          inputs: args.inputs,
          fromSelf,
          info: this.info,
        });
      },
    });
  };

  applyArtifactBuff = (args: ApplyBuffArgs<ArtifactBonusCore>) => {
    const { fromSelf = false } = args;

    this.applyBonuses({
      ...args,
      getBonus: (getArgs) => {
        return getArtifactBonus({
          ...getArgs,
          inputs: args.inputs,
          fromSelf,
          info: this.info,
        });
      },
    });
  };
}
