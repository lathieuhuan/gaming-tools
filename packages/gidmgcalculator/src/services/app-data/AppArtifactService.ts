import type { AppArtifact, ArtifactType } from "@Calculation";
import type { Artifact } from "@Src/types";
import type { GOODArtifact } from "@Src/types/GOOD.types";
import type { DataControl } from "./app-data.types";
import { convertGOODStatKey, toGOODKey } from "./utils";

export type ConvertedArtifact = Artifact & { data: AppArtifact };

export class AppArtifactService {
  private artifacts: Array<DataControl<AppArtifact>> = [];

  populate(artifacts: AppArtifact[]) {
    this.artifacts = artifacts.map((dataArtifact) => ({
      status: "fetched",
      data: dataArtifact,
    }));
  }

  getAll<T>(transform: (data: AppArtifact) => T): T[];
  getAll(): AppArtifact[];
  getAll<T>(transform?: (data: AppArtifact) => T): T[] | AppArtifact[] {
    return transform
      ? this.artifacts.map((artifact) => transform(artifact.data))
      : this.artifacts.map((artifact) => artifact.data);
  }

  getSet(code: number) {
    // no artifact with code 0
    return code ? this.artifacts.find((artifact) => artifact.data.code === code)?.data : undefined;
  }

  get(artifact: { code: number; type: ArtifactType }) {
    const data = this.getSet(artifact.code);
    if (data && data[artifact.type]) {
      const { name, icon } = data[artifact.type];
      return { beta: data.beta, name, icon };
    }
    return undefined;
  }

  convertGOOD(artifact: GOODArtifact, seedId: number): ConvertedArtifact | undefined {
    const data = this.artifacts.find(({ data }) => toGOODKey(data.name) === artifact.setKey)?.data;

    if (!data) {
      return undefined;
    }

    return {
      ID: seedId++,
      code: data.code,
      type: artifact.slotKey,
      rarity: artifact.rarity,
      mainStatType: convertGOODStatKey(artifact.mainStatKey) || "atk",
      subStats: artifact.substats.map((substat) => ({
        type: convertGOODStatKey(substat.key) || "atk",
        value: substat.value,
      })),
      level: artifact.level,
      data,
    };
  }
}
