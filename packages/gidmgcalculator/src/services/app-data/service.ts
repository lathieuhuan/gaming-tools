import { Array_ } from "ron-utils";

import type { TargetData } from "@/types";
import type { AppData } from "./types";

import { queryClient } from "@/lib/react-query";
import { appDataQueryOptions } from "./queryOptions";

export const MS_ASCENDANT_BUFF_ID = 1;

export function getCachedAppData() {
  return queryClient.getQueryData<AppData>(appDataQueryOptions.queryKey);
}

export function getTeamBuffs() {
  return getCachedAppData()?.teamBuffs || [];
}

export function getMonsters() {
  return getCachedAppData()?.monsters || [];
}

export function getMonster({ code }: { code: number }) {
  return Array_.findByCode(getMonsters(), code);
}

export function getTargetInfo(target: TargetData) {
  const monster = getMonster(target);
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
