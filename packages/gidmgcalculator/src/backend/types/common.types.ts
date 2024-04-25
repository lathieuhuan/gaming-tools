import { ARTIFACT_TYPES, ATTACK_ELEMENTS, TRANSFORMATIVE_REACTIONS } from "../constants";

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export type AttackElement = (typeof ATTACK_ELEMENTS)[number];

export type ActualAttackElement = AttackElement | "absorb";

export type TransformativeReaction = (typeof TRANSFORMATIVE_REACTIONS)[number];
