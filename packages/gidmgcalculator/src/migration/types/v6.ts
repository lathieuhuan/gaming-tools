import type { ExactOmit } from "rond";
import type { CurrentDatabaseData } from "./current";

export type DatabaseDataV6 = ExactOmit<CurrentDatabaseData, "version"> & {
  version: 6;
};
