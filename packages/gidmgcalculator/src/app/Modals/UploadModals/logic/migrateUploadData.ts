import type { CurrentDatabaseData } from "@/migration/types/current";

import { DOWNLOAD_DATA_VERSION } from "@/constants/config";
import { convertToV5 } from "@/migration/convertToV5";
import { convertToV6 } from "@/migration/convertToV6";
import { convertToV7 } from "@/migration/convertToV7";

type Migration = {
  version: number;
  fn: (data: any) => any;
};

const MIGRATIONS: Migration[] = [
  { version: 4, fn: convertToV5 },
  { version: 5, fn: convertToV6 },
  { version: 6, fn: convertToV7 },
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
  if (data.version === DOWNLOAD_DATA_VERSION) {
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
