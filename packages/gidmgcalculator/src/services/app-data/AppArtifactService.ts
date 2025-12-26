import type { AppArtifact, ArtifactDebuff, ArtifactType } from "@/types";

type DebuffArtifact = {
  data: AppArtifact;
  debuff?: ArtifactDebuff;
};

const map = new Map<number, AppArtifact>();

class AppArtifactService {
  artifacts: AppArtifact[] = [];
  vvArtifact: DebuffArtifact | undefined;
  deepwoodArtifact: DebuffArtifact | undefined;

  populate(artifacts: AppArtifact[]) {
    map.clear();
    this.artifacts = artifacts;

    for (const artifact of artifacts) {
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
  }

  getAll<T>(transform: (data: AppArtifact) => T): T[];
  getAll(): AppArtifact[];
  getAll<T>(transform?: (data: AppArtifact) => T): T[] | AppArtifact[] {
    return transform ? this.artifacts.map((artifact) => transform(artifact)) : this.artifacts;
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

    const data = this.artifacts.find((artifact) => artifact.code === code);

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

export const $AppArtifact = new AppArtifactService();
