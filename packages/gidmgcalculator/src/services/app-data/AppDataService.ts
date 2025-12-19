import type { AppMonster, AppTeamBuff, ITarget } from "@/types";
import type { AllData } from "./types";

import { BACKEND_URL } from "@/constants";
import Array_ from "@/utils/Array";
import { $AppArtifact } from "./AppArtifactService";
import { $AppCharacter } from "./AppCharacterService";
import { $AppWeapon } from "./AppWeaponService";
import { fetchData } from "./BaseService";

let teamBuffs: AppTeamBuff[] = [];
let monsters: AppMonster[] = [];

async function fetchAllData() {
  return await fetchData<AllData>(BACKEND_URL.allData());
}

function populate(
  data: Pick<AllData, "characters" | "weapons" | "artifacts" | "teamBuffs" | "monsters">
) {
  $AppCharacter.populate(data.characters);
  $AppWeapon.populate(data.weapons);
  $AppArtifact.populate(data.artifacts);
  teamBuffs = data.teamBuffs;
  monsters = data.monsters;
}

function getAll() {
  return {
    characters: $AppCharacter.getAll(),
    weapons: $AppWeapon.getAll(),
    artifacts: $AppArtifact.getAll(),
    teamBuffs,
    monsters,
  };
}

// Monster

function getAllMonsters() {
  return monsters;
}

function getMonster({ code }: { code: number }) {
  return Array_.findByCode(monsters, code);
}

function getTargetInfo(target: ITarget) {
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

export const $AppData = {
  teamBuffs,
  fetchAllData,
  populate,
  getAll,
  getAllMonsters,
  getMonster,
  getTargetInfo,
};
