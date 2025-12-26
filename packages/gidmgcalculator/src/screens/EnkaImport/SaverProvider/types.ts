import type { PartiallyOptional } from "rond";
import type { ArtifactType, IArtifactBasic, IDbCharacter, IWeaponBasic } from "@/types";

export type ExistedItems = Partial<Record<ArtifactType, IArtifactBasic>> & {
  character?: IDbCharacter;
  weapon?: IWeaponBasic;
};

export type SaveSelectionType = "NEW" | "OVERWRITE" | "IGNORE";

export type SaveSelections = PartiallyOptional<
  Record<keyof ExistedItems, SaveSelectionType>,
  ArtifactType
>;
