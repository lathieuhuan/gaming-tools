import { DbComplexSetup } from "@/types";
import type { ExactOmit } from "rond";
import type { CurrentDatabaseData } from "./current";

export type DatabaseDataV7 = ExactOmit<CurrentDatabaseData, "version"> & {
  version: 7;
};

export type DbSetupV7 = Exclude<DatabaseDataV7["setups"][number], DbComplexSetup>;
