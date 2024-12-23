import type { PartiallyOptional } from "rond";
import type { UserArtifact } from "@Src/types";
import { $AppArtifact } from "@Src/services";

type InputArtifact = PartiallyOptional<UserArtifact, "owner">;

type ManagedArtifactSet = {
  data: {
    code: number;
    name: string;
    icon: string;
  };
  pieces: InputArtifact[];
  selectedIds: Set<number>;
  anyEquippedSelected: boolean;
};

export class ArtifactManager {
  sets: ManagedArtifactSet[] = [];

  constructor(artifacts: InputArtifact[]) {
    const countMap = new Map<number, ManagedArtifactSet>();
    const sets: ManagedArtifactSet[] = [];

    for (const artifact of artifacts) {
      const set = countMap.get(artifact.code);

      if (set) {
        set.pieces.push(artifact);
      } //
      else {
        const data = $AppArtifact.getSet(artifact.code);

        if (data) {
          const filterSet: ManagedArtifactSet = {
            data: {
              code: data.code,
              name: data.name,
              icon: data.flower.icon,
            },
            pieces: [artifact],
            selectedIds: new Set(),
            anyEquippedSelected: false,
          };

          countMap.set(artifact.code, filterSet);
          sets.push(filterSet);
        }
      }
    }

    this.sets = sets;
  }

  private getSetThen = (cb: (set: ManagedArtifactSet) => void) => (code: number) => {
    const set = this.sets.find((item) => item.data.code === code);
    if (set) cb(set);
    return this.sets.concat();
  };

  selectAll = this.getSetThen((set) => {
    set.selectedIds.clear();
    set.anyEquippedSelected = false;

    for (const piece of set.pieces) {
      set.selectedIds.add(piece.ID);

      if (piece.owner) set.anyEquippedSelected = true;
    }
  });

  unselectAll = this.getSetThen((set) => {
    set.selectedIds.clear();
    set.anyEquippedSelected = false;
  });

  removeEquipped = this.getSetThen((set) => {
    for (const piece of set.pieces) {
      if (piece.owner) {
        set.selectedIds.delete(piece.ID);
      }
    }
    set.anyEquippedSelected = false;
  });
}
