import type { AppArtifact, AppCharacter, AppWeapon } from "@/types";

export const characterCache = new Map<number, AppCharacter>();
export const weaponCache = new Map<number, AppWeapon>();
export const artifactCache = new Map<number, AppArtifact>();

export function clearCache() {
  characterCache.clear();
  weaponCache.clear();
  artifactCache.clear();
}
