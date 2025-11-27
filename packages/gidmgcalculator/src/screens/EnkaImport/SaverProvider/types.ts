import type { ArtifactType } from "@/types";
import type { IUserArtifact, IUserCharacter, IUserWeapon } from "@/types/user-entity";
import type { PartiallyOptional } from "rond";

export type ExistedItems = Partial<Record<ArtifactType, IUserArtifact>> & {
  character?: IUserCharacter;
  weapon?: IUserWeapon;
};

export type SaveSelectionType = "NEW" | "OVERWRITE" | "IGNORE";

export type SaveSelections = PartiallyOptional<
  Record<keyof ExistedItems, SaveSelectionType>,
  ArtifactType
>;
