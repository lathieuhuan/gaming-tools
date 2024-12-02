import type { AppMonster } from "@Backend";
import type { Target } from "@Src/types";
import type { StandardResponse } from "../services.types";
import type { Metadata, Update } from "./app-data.types";

import { BACKEND_URL } from "@Src/constants";
import Array_ from "@Src/utils/array-utils";
import { BaseService } from "./BaseService";

export class AppDataService extends BaseService {
  private isFetchedMetadata = false;

  private monsters: AppMonster[] = [];
  public version?: string;
  public updates: Update[] = [];
  public supporters: string[] = [];

  public async fetchMetadata(isRefetch?: boolean): Promise<StandardResponse<Metadata>> {
    //
    if (this.isFetchedMetadata && !isRefetch) {
      return {
        code: 400,
        message: "Metadata has been fetched",
        data: null,
      };
    }
    const response = await this.fetchData<Metadata>(BACKEND_URL.metadata());

    if (response.data) {
      this.isFetchedMetadata = true;
      this.version = response.data.version;
      this.monsters = response.data.monsters;
      this.updates = response.data.updates;
      this.supporters = response.data.supporters;

      console.log(this.updates[0]);
    }

    return response;
  }

  // ========== MONSTERS ==========

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
