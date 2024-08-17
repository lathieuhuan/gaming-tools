import { MigrationManifest } from "redux-persist";
import { migrateToV1 } from "./migrateToV1";

export const migrates: MigrationManifest = {
  "1": migrateToV1 as () => any,
};
