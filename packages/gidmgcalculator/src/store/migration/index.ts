import { MigrationManifest } from "redux-persist";
import { migrateToV4 } from "./migrateToV4";
import { migrateToV5 } from "./migrateToV5";
import { migrateToV6 } from "./migrateToV6";
import { migrateToV7 } from "./migrateToV7";
import { migrateToV8 } from "./migrateToV8";

export const migrates: MigrationManifest = {
  4: migrateToV4 as () => any,
  5: migrateToV5 as () => any,
  6: migrateToV6 as () => any,
  7: migrateToV7 as () => any,
  8: migrateToV8 as () => any,
};
