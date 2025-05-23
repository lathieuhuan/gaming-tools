import type { AppMonster } from "@Backend";
import type { Target } from "@Src/types";
import type { Metadata } from "./app-data.types";
import type { AppCharacterService } from "./AppCharacterService";
import type { AppWeaponService } from "./AppWeaponService";
import type { AppArtifactService } from "./AppArtifactService";

import { BACKEND_URL } from "@Src/constants";
import Array_ from "@Src/utils/array-utils";
import { BaseService } from "./BaseService";

export class AppDataService extends BaseService {
  private monsters: AppMonster[] = [];

  constructor(
    private character$: AppCharacterService,
    private weapon$: AppWeaponService,
    private artifact$: AppArtifactService
  ) {
    super();
  }

  async fetchMetadata() {
    return await this.fetchData<Metadata>(BACKEND_URL.metadata());
  }

  get data() {
    return {
      characters: this.character$.getAll(),
      weapons: this.weapon$.getAll(),
      artifacts: this.artifact$.getAll(),
      monsters: this.getAllMonsters(),
    };
  }

  set data(data: Pick<Metadata, "characters" | "weapons" | "artifacts" | "monsters">) {
    this.character$.populate(data.characters);
    this.weapon$.populate(data.weapons);
    this.artifact$.populate(data.artifacts);
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
