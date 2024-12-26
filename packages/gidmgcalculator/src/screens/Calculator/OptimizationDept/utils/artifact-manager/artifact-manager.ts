import type { PartiallyOptional } from "rond";
import type { AppArtifact, ArtifactType, OptimizerArtifactBuffConfigs } from "@Backend";
import type { UserArtifact } from "@Src/types";

import { $AppArtifact } from "@Src/services";
import Modifier_ from "@Src/utils/modifier-utils";
import { WatchedSet, Watcher } from "./watched-set";

type InputArtifact = PartiallyOptional<UserArtifact, "owner">;

export type ManagedArtifactSet = {
  data: AppArtifact;
  pieces: InputArtifact[];
  selectedIds: WatchedSet<number>;
};

export class ArtifactManager {
  sets: ManagedArtifactSet[] = [];
  buffConfigs: OptimizerArtifactBuffConfigs = {};
  sumary: Record<ArtifactType, InputArtifact[]> = {
    flower: [],
    plume: [],
    sands: [],
    goblet: [],
    circlet: [],
  };

  private watcher = new Watcher();

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
            data,
            pieces: [artifact],
            selectedIds: new WatchedSet(this.watcher),
          };

          countMap.set(artifact.code, filterSet);
          sets.push(filterSet);
        }
      }
    }

    this.sets = sets;
  }

  watchChange = () => {
    this.watcher.start();
  };

  get didChange() {
    return this.watcher.changed;
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
    let selected: ManagedArtifactSet["selectedIds"] = new WatchedSet(this.watcher);

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

  updateSelectedIds = (code: number, selectedIds: Set<number>) => {
    this.getSetThen((set) => {
      set.selectedIds.clear();
      selectedIds.forEach((id) => set.selectedIds.add(id));
    })(code);
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

  concludeModConfigs = () => {
    const newBuffConfig: OptimizerArtifactBuffConfigs = {};

    for (const { data, selectedIds } of this.sets) {
      if (selectedIds.size && !newBuffConfig[data.code] && data.buffs) {
        newBuffConfig[data.code] = data.buffs.map<OptimizerArtifactBuffConfigs[string][number]>((buff) => ({
          index: buff.index,
          activated: true,
          inputs: Modifier_.createModCtrlInpus(buff.inputConfigs, true),
        }));
      }
    }
    return (this.buffConfigs = newBuffConfig);
  };

  toggleBuffConfig = (setCode: number, configIndex: number) => {
    const newConfigsByCode = { ...this.buffConfigs };
    const newConfigs = newConfigsByCode[setCode];

    if (newConfigs[configIndex]) {
      newConfigs[configIndex] = {
        ...newConfigs[configIndex],
        activated: !newConfigs[configIndex].activated,
      };
      return (this.buffConfigs = newConfigsByCode);
    }
    return this.buffConfigs;
  };

  changeBuffConfigInputs = (setCode: number, configIndex: number, inputs?: number[]) => {
    const newConfigsByCode = { ...this.buffConfigs };
    const newConfigs = newConfigsByCode[setCode];

    if (newConfigs[configIndex]) {
      newConfigs[configIndex] = {
        ...newConfigs[configIndex],
        inputs,
      };
      return (this.buffConfigs = newConfigsByCode);
    }
    return this.buffConfigs;
  };

  sumarize = () => {
    this.sumary = {
      flower: [],
      plume: [],
      sands: [],
      goblet: [],
      circlet: [],
    };

    for (const set of this.sets) {
      for (const artifact of set.pieces) {
        if (set.selectedIds.has(artifact.ID)) {
          this.sumary[artifact.type] = this.sumary[artifact.type].concat(artifact);
        }
      }
    }
    return this.sumary;
  };
}
