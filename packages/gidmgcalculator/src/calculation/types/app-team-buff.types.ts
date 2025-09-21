import { EntityBonus, EntityBonusEffect, ModInputConfig } from "./app-entity";

export type AppTeamBuff = {
  id: string;
  src: string;
  description: string;
  inputConfigs?: ModInputConfig[];
  effects?: EntityBonus<EntityBonusEffect> | EntityBonus<EntityBonusEffect>[];
};
