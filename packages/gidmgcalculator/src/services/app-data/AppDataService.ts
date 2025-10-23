import type { AppMonster, AppTeamBuff } from "@Calculation";
import type { Target } from "@/types";
import type { AllData } from "./app-data.types";
import type { AppCharacterService } from "./AppCharacterService";
import type { AppWeaponService } from "./AppWeaponService";
import type { AppArtifactService } from "./AppArtifactService";

import { BACKEND_URL } from "@/constants";
import Array_ from "@/utils/Array";
import { BaseService } from "./BaseService";

export class AppDataService extends BaseService {
  teamBuffs: AppTeamBuff[] = [];

  private monsters: AppMonster[] = [];

  constructor(
    private character$: AppCharacterService,
    private weapon$: AppWeaponService,
    private artifact$: AppArtifactService
  ) {
    super();
  }

  async fetchAllData() {
    return await this.fetchData<AllData>(BACKEND_URL.allData());
  }

  get data() {
    return {
      characters: this.character$.getAll(),
      weapons: this.weapon$.getAll(),
      artifacts: this.artifact$.getAll(),
      monsters: this.getAllMonsters(),
      teamBuffs: this.teamBuffs,
    };
  }

  set data(data: Pick<AllData, "characters" | "weapons" | "artifacts" | "teamBuffs" | "monsters">) {
    this.character$.populate(data.characters);
    this.weapon$.populate(data.weapons);
    this.artifact$.populate(data.artifacts);
    this.teamBuffs = data.teamBuffs;
    this.monsters = data.monsters;
  }

  // Monster

  getAllMonsters() {
    return this.monsters;
  }

  getMonster({ code }: { code: number }) {
    return Array_.findByCode(this.monsters, code);
  }

  getTargetInfo(target: Target) {
    const monster = this.getMonster(target);
    let variant = "";
    const statuses: string[] = [];

    if (target.variantType && monster?.variant) {
      for (const type of monster.variant.types) {
        if (typeof type === "string") {
          if (type === target.variantType) {
            variant = target.variantType;
            break;
          }
        } else if (type.value === target.variantType) {
          variant = type.label;
          break;
        }
      }
    }

    if (target.inputs?.length && monster?.inputConfigs) {
      const inputConfigs = Array_.toArray(monster.inputConfigs);

      target.inputs.forEach((input, index) => {
        const { label, type = "check", options = [] } = inputConfigs[index] || {};

        switch (type) {
          case "CHECK":
            if (input) {
              statuses.push(label);
            }
            break;
          case "SELECT": {
            const option = options[input];
            const selectedLabel = typeof option === "string" ? option : option?.label;

            if (selectedLabel) {
              statuses.push(`${label}: ${selectedLabel}`);
            }
            break;
          }
        }
      });
    }

    return {
      title: monster?.title,
      names: monster?.names,
      variant,
      statuses,
    };
  }
}
