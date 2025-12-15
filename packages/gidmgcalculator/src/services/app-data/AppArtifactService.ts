import type { AppArtifact, ArtifactDebuff, ArtifactType } from "@/types";
import type { DataControl } from "./app-data.types";

type DebuffArtifact = {
  data: AppArtifact;
  debuff?: ArtifactDebuff;
};

const map = new Map<number, AppArtifact>();

export class AppArtifactService {
  private artifacts: Array<DataControl<AppArtifact>> = [];

  vvArtifact?: DebuffArtifact;
  deepwoodArtifact?: DebuffArtifact;

  populate(artifacts: AppArtifact[]) {
    map.clear();

    const artifactCtrls: DataControl<AppArtifact>[] = [];

    for (const artifact of artifacts) {
      artifactCtrls.push({
        status: "fetched",
        data: artifact,
      });

      if (artifact.code === 15) {
        this.vvArtifact = {
          data: artifact,
          debuff: artifact.debuffs?.[0],
        };
      }

      if (artifact.code === 33) {
        this.deepwoodArtifact = {
          data: artifact,
          debuff: artifact.debuffs?.[0],
        };
      }
    }

    this.artifacts = artifactCtrls;
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
    if (!code) {
      return undefined;
    }

    const cached = map.get(code);

    if (cached) {
      return cached;
    }

    const data = this.artifacts.find((artifact) => artifact.data.code === code)?.data;

    if (data) {
      map.set(code, data);
      return data;
    }

    return undefined;
  }

  get(artifact: { code: number; type: ArtifactType }) {
    const data = this.getSet(artifact.code);
    if (data && data[artifact.type]) {
      const { name, icon } = data[artifact.type];
      return { beta: data.beta, name, icon };
    }
    return undefined;
  }
}
