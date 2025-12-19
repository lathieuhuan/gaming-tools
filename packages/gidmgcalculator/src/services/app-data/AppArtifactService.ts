import type { AppArtifact, ArtifactDebuff, ArtifactType } from "@/types";

type DebuffArtifact = {
  data: AppArtifact;
  debuff?: ArtifactDebuff;
};

const map = new Map<number, AppArtifact>();

let artifacts_: AppArtifact[] = [];

let vvArtifact: DebuffArtifact | undefined;
let deepwoodArtifact: DebuffArtifact | undefined;

function populate(artifacts: AppArtifact[]) {
  map.clear();
  artifacts_ = artifacts;

  for (const artifact of artifacts) {
    if (artifact.code === 15) {
      vvArtifact = {
        data: artifact,
        debuff: artifact.debuffs?.[0],
      };
    }

    if (artifact.code === 33) {
      deepwoodArtifact = {
        data: artifact,
        debuff: artifact.debuffs?.[0],
      };
    }
  }
}

function getAll<T>(transform: (data: AppArtifact) => T): T[];
function getAll(): AppArtifact[];
function getAll<T>(transform?: (data: AppArtifact) => T): T[] | AppArtifact[] {
  return transform ? artifacts_.map((artifact) => transform(artifact)) : artifacts_;
}

function getSet(code: number) {
  // no artifact with code 0
  if (!code) {
    return undefined;
  }

  const cached = map.get(code);

  if (cached) {
    return cached;
  }

  const data = artifacts_.find((artifact) => artifact.code === code);

  if (data) {
    map.set(code, data);
    return data;
  }

  return undefined;
}

function get(artifact: { code: number; type: ArtifactType }) {
  const data = getSet(artifact.code);

  if (data && data[artifact.type]) {
    const { name, icon } = data[artifact.type];
    return { beta: data.beta, name, icon };
  }

  return undefined;
}

export const $AppArtifact = {
  vvArtifact,
  deepwoodArtifact,
  populate,
  getAll,
  getSet,
  get,
};
