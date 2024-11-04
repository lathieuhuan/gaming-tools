import type { CalculationInfo } from "../utils";
import type { ResistanceReductionControl } from "../controls";
import {
  ApplyArtifactDebuffArgs,
  ApplyCharacterDebuffArgs,
  ApplyDebuffArgs,
  DebuffApplierCore,
} from "./debuff-applier-core";

type InternalApplyDebuffArgs<T extends ApplyDebuffArgs<any>> = Omit<T, "applyPenalty">;

export class CalcDebuffApplier extends DebuffApplierCore {
  private _applyPenalty: ApplyDebuffArgs<any>["applyPenalty"] = () => {};

  constructor(info: CalculationInfo, resistReduct: ResistanceReductionControl) {
    super(info);

    this._applyPenalty = (penalty) => {
      resistReduct.add(penalty.key, penalty.value, penalty.description);
    };
  }

  applyCharacterDebuff = (args: InternalApplyDebuffArgs<ApplyCharacterDebuffArgs>) => {
    this._applyCharacterDebuff({
      ...args,
      applyPenalty: this._applyPenalty,
    });
  };

  applyArtifactDebuff = (args: InternalApplyDebuffArgs<ApplyArtifactDebuffArgs>) => {
    this._applyArtifactDebuff({
      ...args,
      applyPenalty: this._applyPenalty,
    });
  };
}
