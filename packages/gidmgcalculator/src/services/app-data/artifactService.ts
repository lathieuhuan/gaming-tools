import type { AppArtifact } from "@/types";
import { artifactCache } from "./cache";
import { getCachedAppData } from "./selector";

export function getAppArtifacts(): AppArtifact[] {
  return getCachedAppData()?.artifacts || [];
}

export function getAppArtifact(code: number) {
  // no artifact with code 0
  if (!code) {
    return undefined;
  }

  const cachedAtf = artifactCache.get(code);

  if (cachedAtf) {
    return cachedAtf;
  }

  const data = getAppArtifacts().find((artifact) => artifact.code === code);

  if (data) {
    artifactCache.set(code, data);
    return data;
  }

  return undefined;
}
