import type { ElementType } from "@/types";

export type AppEntityOptionModel = {
  code: number;
  beta?: boolean;
  name: string;
  icon: string;
  rarity?: number;
  vision?: ElementType;
  cons?: number;
};
