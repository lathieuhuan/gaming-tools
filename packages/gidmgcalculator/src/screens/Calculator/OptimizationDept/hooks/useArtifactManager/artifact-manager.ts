import type { PartiallyOptional } from "rond";
import type { UserArtifact } from "@Src/types";
import { $AppArtifact } from "@Src/services";

type ManagedArtifactSet = {
  data: {
    code: number;
    name: string;
    icon: string;
  };
  total: number;
  selected: number;
};

export class ArtifactManager {
  sets: ManagedArtifactSet[] = [];

  constructor(artifacts: PartiallyOptional<UserArtifact, "owner">[]) {
    const countMap = new Map<number, ManagedArtifactSet>();
    const sets: ManagedArtifactSet[] = [];

    for (const { code } of artifacts) {
      const set = countMap.get(code);

      if (set) {
        set.total += 1;
      } //
      else {
        const data = $AppArtifact.getSet(code);

        if (data) {
          const filterSet: ManagedArtifactSet = {
            data: {
              code: data.code,
              name: data.name,
              icon: data.flower.icon,
            },
            total: 1,
            selected: 0,
          };

          countMap.set(code, filterSet);
          sets.push(filterSet);
        }
      }
    }

    this.sets = sets;
  }
}
