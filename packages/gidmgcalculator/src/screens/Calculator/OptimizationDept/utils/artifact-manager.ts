import type { PartiallyOptional } from "rond";
import { ARTIFACT_TYPES, type AppArtifact, type ArtifactType, type OptimizerArtifactBuffConfigs } from "@Backend";
import type { UserArtifact } from "@Src/types";

import { $AppArtifact } from "@Src/services";
import Modifier_ from "@Src/utils/modifier-utils";

type InputArtifact = PartiallyOptional<UserArtifact, "owner">;

export type ManagedArtifactSet = {
  data: AppArtifact;
  pieces: InputArtifact[];
  selectedIds: Set<number>;
};

type CalculationCount = {
  isExceeded: boolean;
  value: number;
};

export class ArtifactManager {
  private readonly MAX_ACTUAL_COUNT = 100_000_000_000;
  readonly LIMIT_CALC_COUNT = 1_000_000;

  sets: ManagedArtifactSet[] = [];
  buffConfigs: OptimizerArtifactBuffConfigs = {};
  sumary: Record<ArtifactType, InputArtifact[]> = {
    flower: [],
    plume: [],
    sands: [],
    goblet: [],
    circlet: [],
  };
  calcCount: CalculationCount = {
    isExceeded: false,
    value: 1,
  };

  private recordedOnce = false;
  private selectedCodes = new Set<number>();

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
            selectedIds: new Set(),
          };

          countMap.set(artifact.code, filterSet);
          sets.push(filterSet);
        }
      }
    }

    this.sets = sets;
  }

  private getSelectedCodes() {
    return this.sets.reduce(
      (codes, set) => (set.selectedIds.size ? codes.add(set.data.code) : codes),
      new Set<number>()
    );
  }

  get hasNewSelectedSet() {
    if (this.recordedOnce) {
      for (const code of this.getSelectedCodes()) {
        if (!this.selectedCodes.has(code)) {
          return true;
        }
      }
    }
    return false;
  }

  recordSelectedSets = () => {
    this.recordedOnce = true;
    this.selectedCodes = this.getSelectedCodes();
  };

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
          inputs: Modifier_.createModCtrlInpus(buff.inputConfigs, true, true),
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
          this.sumary[artifact.type].push(artifact);
        }
      }
    }

    const calcCount: CalculationCount = { isExceeded: false, value: 1 };

    for (const type of ARTIFACT_TYPES) {
      calcCount.value *= this.sumary[type].length;

      if (!calcCount.isExceeded && calcCount.value > this.LIMIT_CALC_COUNT) {
        calcCount.isExceeded = true;
      }
      if (calcCount.value > this.MAX_ACTUAL_COUNT) {
        break;
      }
    }
    this.calcCount = calcCount;

    return this;
  };
}
