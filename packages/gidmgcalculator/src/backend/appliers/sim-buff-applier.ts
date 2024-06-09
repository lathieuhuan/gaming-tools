import type { CalculationInfo } from "@Src/backend/utils";

import { TotalAttributeControl } from "@Src/backend/controls";
import {
  ApplyArtifactBuffArgs,
  ApplyBuffArgs,
  ApplyCharacterBuffArgs,
  ApplyWeaponBuffArgs,
  BuffApplierCore,
} from "./buff-applier-core";

type InternalApplyBuffArgs<T extends ApplyBuffArgs<any>> = Omit<T, "fromSelf" | "isFinal">;

export class SimulatorBuffApplier extends BuffApplierCore {
  constructor(info: CalculationInfo, totalAttr: TotalAttributeControl) {
    super(info, totalAttr);
  }

  applyCharacterBuff = (args: InternalApplyBuffArgs<ApplyCharacterBuffArgs>) => {
    this._applyCharacterBuff({
      ...args,
      fromSelf: true,
    });
  };

  applyWeaponBuff = (args: InternalApplyBuffArgs<ApplyWeaponBuffArgs>) => {
    this._applyWeaponBuff({
      ...args,
      fromSelf: true,
    });
  };

  applyArtifactBuff = (args: InternalApplyBuffArgs<ApplyArtifactBuffArgs>) => {
    this._applyArtifactBuff({
      ...args,
      fromSelf: true,
    });
  };
}
