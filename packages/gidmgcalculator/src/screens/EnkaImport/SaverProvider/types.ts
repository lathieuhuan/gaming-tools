import type { ArtifactType } from "@/types";
import type { IDbArtifact, IUserCharacter, IDbWeapon } from "@/types/db-entity";
import type { PartiallyOptional } from "rond";

export type ExistedItems = Partial<Record<ArtifactType, IDbArtifact>> & {
  character?: IUserCharacter;
  weapon?: IDbWeapon;
};

export type SaveSelectionType = "NEW" | "OVERWRITE" | "IGNORE";

export type SaveSelections = PartiallyOptional<
  Record<keyof ExistedItems, SaveSelectionType>,
  ArtifactType
>;
