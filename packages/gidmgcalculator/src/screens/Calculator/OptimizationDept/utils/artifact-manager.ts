import type { PartiallyOptional } from "rond";
import type { UserArtifact } from "@Src/types";
import { $AppArtifact } from "@Src/services";

type InputArtifact = PartiallyOptional<UserArtifact, "owner">;

export type ManagedArtifactSet = {
  data: {
    code: number;
    name: string;
    icon: string;
  };
  pieces: InputArtifact[];
  selectedIds: Set<number>;
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
          };

          countMap.set(artifact.code, filterSet);
          sets.push(filterSet);
        }
      }
    }

    this.sets = sets;
  }

  checkAnyEquippedSelected = (set: ManagedArtifactSet) => {
    for (const piece of set.pieces) {
      if (piece.owner && set.selectedIds.has(piece.ID)) {
        return true;
      }
    }
    return false;
  };

  private getSetThen = (onFoundSet: (set: ManagedArtifactSet) => void) => (codes: number | Set<number>) => {
    if (typeof codes === "number") {
      const set = this.sets.find((item) => item.data.code === codes);
      if (set) onFoundSet(set);
    } else {
      codes.forEach((code) => this.getSetThen(onFoundSet)(code));
    }
    return this.sets.concat();
  };

  /** @params code 0 to get the fake set */
  getSet = (code: number) => {
    let artifacts: InputArtifact[] = [];
    let selected: ManagedArtifactSet["selectedIds"] = new Set();

    if (code) {
      this.getSetThen((set) => {
        artifacts = set.pieces;
        selected = set.selectedIds;
      })(code);
    }

    return {
      code,
      artifacts,
      selected,
    };
  };

  updateSelectedIds = (code: number, selectedIds: ManagedArtifactSet["selectedIds"]) => {
    this.getSetThen((set) => (set.selectedIds = selectedIds))(code);
  };

  selectAll = this.getSetThen((set) => {
    set.selectedIds.clear();

    for (const piece of set.pieces) {
      set.selectedIds.add(piece.ID);
    }
  });

  unselectAll = this.getSetThen((set) => {
    set.selectedIds.clear();
  });

  removeEquipped = this.getSetThen((set) => {
    for (const piece of set.pieces) {
      if (piece.owner) {
        set.selectedIds.delete(piece.ID);
      }
    }
  });
}
