import type { CurrentDatabaseData } from "@/mirgration/types/current";

import { DATABASE_DATA_VERSION } from "@/constants/config";
import { convertToV3_1 } from "@/mirgration/convertToV3_1";
import { convertToV4 } from "@/mirgration/convertToV4";

type MigrationFn = (data: any) => any;

type Migration = {
  version: number;
  fn: MigrationFn;
};

const MIGRATIONS: Migration[] = [
  { version: 3, fn: convertToV3_1 },
  { version: 3.1, fn: convertToV4 },
];

type OldData = {
  version: number;
  characters: unknown[];
  weapons: unknown[];
  artifacts: unknown[];
  setups?: unknown[];
};

type MigrateResult =
  | {
      status: "FAILED";
      error: string;
    }
  | {
      status: "SUCCESS";
      data: CurrentDatabaseData;
    };

export function migrateUploadData(data: OldData): MigrateResult {
  if (data.version < 3) {
    return {
      status: "FAILED",
      error: "Your data are too old and cannot be converted to the current version.",
    };
  }

  if (data.version === DATABASE_DATA_VERSION) {
    return {
      status: "SUCCESS",
      data: data as CurrentDatabaseData,
    };
  }

  let currentIndex = MIGRATIONS.findIndex((migration) => migration.version === data.version);
  let currentData = data;

  if (currentIndex === -1) {
    return {
      status: "FAILED",
      error: "Your version of data cannot be recognised.",
    };
  }

  while (currentIndex < MIGRATIONS.length) {
    const currentMigration = MIGRATIONS[currentIndex];

    currentData = currentMigration.fn(currentData);
    currentIndex++;
  }

  return {
    status: "SUCCESS",
    data: currentData as CurrentDatabaseData,
  };
}
