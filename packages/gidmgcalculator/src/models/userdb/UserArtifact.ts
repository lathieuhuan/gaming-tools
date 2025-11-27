import type { AppArtifact } from "@/types";
import type { IUserArtifact } from "@/types/user-entity";

import { Artifact, ArtifactConstructInfo } from "@/models/base";

type UserArtifactConstructInfo = ArtifactConstructInfo & {
  owner?: string;
  setupIDs?: number[];
};

type UserArtifactFromOptions = {
  ID?: number;
  owner?: string;
  setupIDs?: number[];
};

export class UserArtifact extends Artifact implements IUserArtifact {
  owner?: string;
  setupIDs?: number[];

  constructor(info: UserArtifactConstructInfo, data: AppArtifact) {
    super(info, data);

    this.owner = info.owner;
    this.setupIDs = info.setupIDs;
  }

  static from(artifact: Artifact, options: UserArtifactFromOptions = {}): IUserArtifact {
    const { ID = artifact.ID, owner, setupIDs } = options;

    return {
      ...artifact,
      ID,
      ...(owner && { owner }),
      ...(setupIDs && { setupIDs }),
    };
  }
}
