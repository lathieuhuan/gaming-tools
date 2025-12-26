import type { ExactOmit } from "rond";
import type { CurrentDatabaseData } from "./current";

export type DatabaseDataV4 = ExactOmit<CurrentDatabaseData, "version"> & {
  version: 4;
};
