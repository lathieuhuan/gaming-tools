import { ArtifactType } from "@/calculation/types";
import { UserArtifact, UserCharacter, UserWeapon } from "@/types/user-entity.types";
import { PartiallyOptional } from "rond";

export type ExistedItems = Partial<Record<ArtifactType, UserArtifact>> & {
  character?: UserCharacter;
  weapon?: UserWeapon;
};

export type SaveSelectionType = "NEW" | "OVERWRITE" | "IGNORE";

export type SaveSelections = PartiallyOptional<
  Record<keyof ExistedItems, SaveSelectionType>,
  ArtifactType
>;
