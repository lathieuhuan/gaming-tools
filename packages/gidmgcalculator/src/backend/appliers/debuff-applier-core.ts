import type {
  ArtifactPenaltyCore,
  CharacterPenaltyCore,
  EntityDebuff,
  EntityPenalty,
  EntityPenaltyTarget,
  ResistanceReductionKey,
  WithPenaltyTargets,
} from "@Src/backend/types";

import { toArray } from "@Src/utils";
import { CalculationInfo, EntityCalc } from "@Src/backend/utils";
import { ELEMENT_TYPES } from "@Src/backend/constants";
import { GetPenaltyArgs, getPenaltyFromCharacter, getPenaltyFromArtifact } from "@Src/backend/penalty-getters";

type ApplyPenaltyArgs = {
  penalty: number;
  targets: EntityPenaltyTarget | EntityPenaltyTarget[];
  inputs: number[];
  description: string;
  applyPenalty: (args: { key: ResistanceReductionKey; value: number; description: string }) => void;
};

type ApplyPenaltiesArgs<T extends EntityPenalty> = Pick<ApplyPenaltyArgs, "inputs" | "description" | "applyPenalty"> & {
  debuff: Pick<EntityDebuff<T>, "effects">;
  getPenalty: (args: Pick<GetPenaltyArgs<T>, "config">) => number;
  fromSelf: boolean;
};

export type ApplyDebuffArgs<T extends EntityPenalty> = Omit<ApplyPenaltiesArgs<WithPenaltyTargets<T>>, "getPenalty">;

export type ApplyCharacterDebuffArgs = ApplyDebuffArgs<CharacterPenaltyCore>;

export type ApplyArtifactDebuffArgs = ApplyDebuffArgs<ArtifactPenaltyCore>;

export class DebuffApplierCore {
  info: CalculationInfo;

  constructor(info: CalculationInfo) {
    this.info = info;
  }

  private applyPenalty = (args: ApplyPenaltyArgs) => {
    if (!args.penalty) return;

    for (const target of toArray(args.targets)) {
      let path: ResistanceReductionKey;

      if (typeof target === "string") {
        path = target;
      } else {
        const elmtIndex = args.inputs[target.inpIndex ?? 0];
        path = ELEMENT_TYPES[elmtIndex];
      }

      args.applyPenalty({
        key: path,
        value: args.penalty,
        description: args.description,
      });
    }
  };

  private applyPenalties = (args: ApplyPenaltiesArgs<WithPenaltyTargets<EntityPenalty>>) => {
    const { debuff, fromSelf, getPenalty, ...applyArgs } = args;
    if (!debuff.effects) return;

    for (const config of toArray(debuff.effects)) {
      if (EntityCalc.isApplicableEffect(config, this.info, args.inputs, fromSelf)) {
        this.applyPenalty({
          ...applyArgs,
          penalty: getPenalty({
            config,
          }),
          targets: config.targets,
        });
      }
    }
  };

  protected _applyCharacterDebuff = (args: ApplyCharacterDebuffArgs) => {
    this.applyPenalties({
      ...args,
      getPenalty: (getArgs) => {
        return getPenaltyFromCharacter({
          ...getArgs,
          inputs: args.inputs,
          fromSelf: args.fromSelf,
          info: this.info,
        });
      },
    });
  };

  protected _applyArtifactDebuff = (args: ApplyArtifactDebuffArgs) => {
    this.applyPenalties({
      ...args,
      getPenalty: (getArgs) => {
        return getPenaltyFromArtifact({
          ...getArgs,
          inputs: args.inputs,
          fromSelf: args.fromSelf,
          info: this.info,
        });
      },
    });
  };
}
