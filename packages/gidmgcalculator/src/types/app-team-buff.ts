import type { EntityBonus, EntityBonusEffect, EntityModifier } from "./app-entity";

export type AppTeamBuff = EntityModifier & {
  src: string;
  description: string;
  effects?: EntityBonus<EntityBonusEffect> | EntityBonus<EntityBonusEffect>[];
};
