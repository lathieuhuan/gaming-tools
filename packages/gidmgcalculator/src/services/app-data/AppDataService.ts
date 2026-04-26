import { Array_ } from "ron-utils";

import type { AppMonster, AppTeamBuff, TargetData } from "@/types";
import type { AllData } from "./types";

import { $AppArtifact } from "./AppArtifactService";
import { $AppCharacter } from "./AppCharacterService";
import { $AppWeapon } from "./AppWeaponService";
import { customFetch } from "./BaseService";
import { API_URL } from "./url";

class AppDataService {
  teamBuffs: AppTeamBuff[] = [];
  monsters: AppMonster[] = [];

  async fetchAllData() {
    return await customFetch<AllData>(API_URL.allData());
  }

  populate(data: Pick<AllData, "characters" | "weapons" | "artifacts" | "teamBuffs" | "monsters">) {
    $AppCharacter.populate(data.characters);
    $AppWeapon.populate(data.weapons);
    $AppArtifact.populate(data.artifacts);
    this.teamBuffs = data.teamBuffs;
    this.monsters = data.monsters;
  }

  getAll() {
    return {
      characters: $AppCharacter.getAll(),
      weapons: $AppWeapon.getAll(),
      artifacts: $AppArtifact.getAll(),
      teamBuffs: this.teamBuffs,
      monsters: this.monsters,
    };
  }

  // Monster

  getAllMonsters() {
    return this.monsters;
  }

  getMonster({ code }: { code: number }) {
    return Array_.findByCode(this.monsters, code);
  }

  getTargetInfo(target: TargetData) {
    const monster = this.getMonster(target);
    let variant: string | undefined;
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

export const $AppData = new AppDataService();
