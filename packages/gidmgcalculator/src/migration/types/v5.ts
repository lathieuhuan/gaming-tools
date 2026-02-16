import type { ExactOmit } from "rond";
import type { CurrentDatabaseData } from "./current";

export type DatabaseDataV5 = ExactOmit<CurrentDatabaseData, "version"> & {
  version: 5;
};
