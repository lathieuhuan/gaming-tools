import { LEVELS } from "../constants";

export * from "./common.types";
export * from "./app-character.types";
export * from "./app-weapon.types";
export * from "./app-artifact.types";
export * from "./app-entity.types";

export type Level = (typeof LEVELS)[number];
