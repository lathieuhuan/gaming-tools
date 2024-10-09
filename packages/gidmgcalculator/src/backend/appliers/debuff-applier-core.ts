import type {
  ArtifactPenaltyCore,
  CharacterPenaltyCore,
  ElementType,
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
    const paths = new Set<ResistanceReductionKey>();

    for (const target of toArray(args.targets)) {
      if (typeof target === "string") {
        paths.add(target);
        continue;
      }
      switch (target.type) {
        case "inp_elmt": {
          const elmtIndex = args.inputs[target.inpIndex ?? 0];
          paths.add(ELEMENT_TYPES[elmtIndex]);
          break;
        }
        case "XILONEN": {
          const elmts: ElementType[] = ["pyro", "hydro", "cryo", "electro"];
          let remainingCount = 3;

          for (const teammate of this.info.partyData.concat(this.info.appChar)) {
            if (teammate && elmts.includes(teammate.vision)) {
              paths.add(teammate.vision);
              remainingCount--;
            }
          }
          if (remainingCount > 0) paths.add("geo");
          break;
        }
      }
    }
    for (const path of paths) {
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
        const penalty = getPenalty({
          config,
        });

        this.applyPenalty({
          ...applyArgs,
          penalty,
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
