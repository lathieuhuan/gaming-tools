import { MigrationManifest } from "redux-persist";
import { migrateToV1 } from "./migrateToV1";
import { migrateToV4 } from "./migrateToV4";

export const migrates: MigrationManifest = {
  1: migrateToV1 as () => any,
  2: (data) => data,
  3: (data) => data,
  4: migrateToV4 as () => any,
};
