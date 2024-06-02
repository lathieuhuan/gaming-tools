import type { PartiallyRequired } from "rond";
import type { AttributeStat, CoreStat } from "@Src/backend/types";

/** Actually does not contain "hp_" | "atk_" | "def_" */
type TotalAttributeStat = AttributeStat | "hp_base" | "atk_base" | "def_base";

export type ArtifactAttribute = PartiallyRequired<Partial<Record<TotalAttributeStat, number>>, CoreStat>;

/** Actually does not contain "hp_" | "atk_" | "def_" */
export type TotalAttribute = Record<TotalAttributeStat, number>;
