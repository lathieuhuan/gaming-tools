import type { AppArtifact, IDbArtifact } from "@/types";

import { Artifact } from "@/models/base";
import Object_ from "@/utils/Object";

type UserArtifactFromOptions = {
  ID?: number;
  owner?: string;
  setupIDs?: number[];
};

export class UserArtifact extends Artifact implements IDbArtifact {
  owner?: string;
  setupIDs?: number[];

  constructor(info: IDbArtifact, data: AppArtifact) {
    super(info, data);

    Object_.optionalAssign<UserArtifact>(this, {
      owner: info.owner,
      setupIDs: info.setupIDs,
    });
  }

  static from(artifact: Artifact, options: UserArtifactFromOptions = {}): IDbArtifact {
    const { ID = artifact.ID, owner, setupIDs } = options;

    return new UserArtifact({ ...artifact, ID, owner, setupIDs }, artifact.data);
  }

  serialize(): IDbArtifact {
    const basic = super.serialize();

    return Object_.optionalAssign<IDbArtifact>(basic, {
      owner: this.owner,
      setupIDs: this.setupIDs,
    });
  }
}
