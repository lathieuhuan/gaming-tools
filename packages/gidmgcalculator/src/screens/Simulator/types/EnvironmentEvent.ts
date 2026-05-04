import type { EEventCategory } from "../configs";

type EnvironmentEventCore = {
  id: string;
  cate: EEventCategory.ENVIRONMENT;
};

export type RawEnvironmentEvent = EnvironmentEventCore;

export type EnvironmentEvent = EnvironmentEventCore;