import type { AppArtifact, ArtifactType } from "@Backend";
import type { DataControl } from "./app-data.types";

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
}
