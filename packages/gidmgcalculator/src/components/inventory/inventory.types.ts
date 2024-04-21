import { UserArtifact, UserWeapon } from "@Src/types";

type UserItem = UserWeapon | UserArtifact;

type CommonRackProps = {
  itemCls?: string;
  emptyText?: string;
  chosenID?: number;
  chosenIDs?: Record<string, boolean>;
  /** Default to 60 */
  pageSize?: number;
};

export type WeaponRackProps = CommonRackProps & {
  data: UserWeapon[];
  onUnselectItem?: (item: UserWeapon) => void;
  onChangeItem?: (item: UserWeapon | undefined) => void;
};

export type ArtifactRackProps = CommonRackProps & {
  data: UserArtifact[];
  onUnselectItem?: (item: UserArtifact) => void;
  onChangeItem?: (item: UserArtifact | undefined) => void;
};

export type MixedRackProps = CommonRackProps & {
  data: UserWeapon[] | UserArtifact[];
  onUnselectItem?: (item: UserItem) => void;
  onChangeItem?: (item: UserItem | undefined) => void;
};

export interface InventoryRackProps<T extends UserItem> extends CommonRackProps {
  data: T[];
  onUnselectItem?: (item: T) => void;
  onChangeItem?: (item: T | undefined) => void;
}
