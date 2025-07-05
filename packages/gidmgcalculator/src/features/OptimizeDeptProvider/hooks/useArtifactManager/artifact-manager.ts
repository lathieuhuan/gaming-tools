import { ARTIFACT_TYPES } from "@Calculation";

import type { ArtifactType, OptimizerAllArtifactModConfigs, OptimizerArtifactModConfigs } from "@Calculation";
import type { AppArtifactsByCode } from "@Src/types";
import type {
  CalculationCount,
  ChangeModConfigInputs,
  InputArtifact,
  ManagedArtifactSet,
  ToggleModConfig,
} from "./artifact-manager.types";

import { $AppArtifact } from "@Src/services";
import Modifier_ from "@Src/utils/modifier-utils";
import Object_ from "@Src/utils/object-utils";

export class ArtifactManager {
  private readonly MAX_ACTUAL_COUNT = 100_000_000_000;
  readonly LIMIT_CALC_COUNT = 1_000_000;

  sets: ManagedArtifactSet[] = [];
  buffConfigs: OptimizerArtifactModConfigs = {};
  debuffConfigs: OptimizerArtifactModConfigs = {};
  sumary: Record<ArtifactType, InputArtifact[]> = {
    flower: [],
    plume: [],
    sands: [],
    goblet: [],
    circlet: [],
  };
  appArtifacts: AppArtifactsByCode = {};

  calcCount: CalculationCount = {
    isExceededLimit: false,
    value: 1,
  };

  private recordedOnce = false;
  private recordedModCodes: string[] = [];

  get allModConfigs(): OptimizerAllArtifactModConfigs {
    return {
      buffs: this.buffConfigs,
      debuffs: this.debuffConfigs,
    };
  }

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

  private getCurrentModCodes() {
    return Object.keys(this.buffConfigs).concat(Object.keys(this.debuffConfigs));
  }

  recordPresentMods = () => {
    this.recordedOnce = true;
    this.recordedModCodes = this.getCurrentModCodes();
  };

  //

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
    let selectedIds: ManagedArtifactSet["selectedIds"] = new Set();

    if (code) {
      this.getSetThen((set) => {
        artifacts = Object_.clone(set.pieces);
        selectedIds = new Set(set.selectedIds);
      })(code);
    }

    return {
      code,
      artifacts,
      selectedIds,
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

  /** @returns true if there is any new selected artifact set */
  concludeModConfigs = () => {
    const newBuffConfigs: OptimizerArtifactModConfigs = {};
    const newDebuffConfigs: OptimizerArtifactModConfigs = {};

    for (const { data, selectedIds } of this.sets) {
      if (selectedIds.size) {
        if (!newBuffConfigs[data.code] && data.buffs) {
          newBuffConfigs[data.code] = data.buffs.map<OptimizerArtifactModConfigs[string][number]>((buff) => ({
            code: data.code,
            index: buff.index,
            activated: true,
            inputs: Modifier_.createModCtrlInpus(buff.inputConfigs, true, true),
          }));
        }
        if (!newDebuffConfigs[data.code] && data.debuffs) {
          newDebuffConfigs[data.code] = data.debuffs.map<OptimizerArtifactModConfigs[string][number]>((buff) => ({
            code: data.code,
            index: buff.index,
            activated: true,
            inputs: Modifier_.createModCtrlInpus(buff.inputConfigs, true, true),
          }));
        }
      }
    }

    this.buffConfigs = newBuffConfigs;
    this.debuffConfigs = newDebuffConfigs;

    if (this.recordedOnce) {
      return this.getCurrentModCodes().some((code) => !this.recordedModCodes.includes(code));
    }
    return false;
  };

  // ===== BUFFS =====

  toggleBuffConfig: ToggleModConfig = (setCode, configIndex) => {
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

  changeBuffConfigInputs: ChangeModConfigInputs = (setCode, configIndex, inputs) => {
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

  // ===== DEBUFFS =====

  toggleDebuffConfig: ToggleModConfig = (setCode, configIndex) => {
    const newConfigsByCode = { ...this.debuffConfigs };
    const newConfigs = newConfigsByCode[setCode];

    if (newConfigs[configIndex]) {
      newConfigs[configIndex] = {
        ...newConfigs[configIndex],
        activated: !newConfigs[configIndex].activated,
      };
      return (this.debuffConfigs = newConfigsByCode);
    }
    return this.debuffConfigs;
  };

  changeDebuffConfigInputs: ChangeModConfigInputs = (setCode, configIndex, inputs) => {
    const newConfigsByCode = { ...this.debuffConfigs };
    const newConfigs = newConfigsByCode[setCode];

    if (newConfigs[configIndex]) {
      newConfigs[configIndex] = {
        ...newConfigs[configIndex],
        inputs,
      };
      return (this.debuffConfigs = newConfigsByCode);
    }
    return this.debuffConfigs;
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
          this.appArtifacts[set.data.code] = set.data;
          this.sumary[artifact.type].push(artifact);
        }
      }
    }

    const calcCount: CalculationCount = { isExceededLimit: false, value: 1 };

    for (const type of ARTIFACT_TYPES) {
      calcCount.value *= this.sumary[type].length || 1;

      if (!calcCount.isExceededLimit && calcCount.value > this.LIMIT_CALC_COUNT) {
        calcCount.isExceededLimit = true;
      }
      if (calcCount.value > this.MAX_ACTUAL_COUNT) {
        break;
      }
    }
    this.calcCount = calcCount;

    return this;
  };
}
