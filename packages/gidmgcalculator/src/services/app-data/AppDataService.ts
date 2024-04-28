import type { Target } from "@Src/types";
import type { AppArtifact, AppWeapon, AppMonster, ArtifactType, WeaponType } from "@Backend";
import type { DataControl, Metadata, Update } from "./app-data.types";

import { BACKEND_URL } from "@Src/constants";
import { findByCode, toArray } from "@Src/utils";
import { BaseService } from "./BaseService";

export class AppDataService extends BaseService {
  private isFetchedMetadata = false;

  private weapons: Array<DataControl<AppWeapon>> = [];
  private artifacts: Array<DataControl<AppArtifact>> = [];
  private monsters: AppMonster[] = [];
  public updates: Update[] = [];
  public supporters: string[] = [];

  constructor() {
    super();
    // this.characters = characters.map((character) => ({
    //   status: "fetched",
    //   data: character,
    // }));
  }

  private getItemControl(type: "weapons", code: number): DataControl<AppWeapon> | undefined;
  private getItemControl(type: "artifacts", code: number): DataControl<AppArtifact> | undefined;
  private getItemControl(type: "weapons" | "artifacts", code: number) {
    return type === "weapons"
      ? this.weapons.find((weapon) => weapon.data.code === code)
      : this.artifacts.find((artifact) => artifact.data.code === code);
  }

  public async fetchMetadata(onSuccess: (metaData: Metadata) => void) {
    if (this.isFetchedMetadata) {
      return true;
    }
    const response = await this.fetchData<Metadata>(BACKEND_URL.metadata());

    if (response.data) {
      this.isFetchedMetadata = true;

      // response.data.characters.forEach((dataCharacter) => {
      //   const control = this.getCharacterControl(dataCharacter.name);

      //   if (control) {
      //     Object.assign(control.data, dataCharacter);
      //   }
      // });

      onSuccess(response.data);

      this.weapons = response.data.weapons.map((dataWeapon) => ({
        status: "fetched",
        data: dataWeapon,
      }));

      this.artifacts = response.data.artifacts.map((dataArtifact) => ({
        status: "fetched",
        data: dataArtifact,
      }));

      this.monsters = response.data.monsters;
      this.updates = response.data.updates;
      this.supporters = response.data.supporters;

      return true;
    }

    return false;
  }

  // ========== WEAPONS ==========

  getAllWeapons(type?: WeaponType): AppWeapon[];
  getAllWeapons<T>(transform: (weapon: AppWeapon) => T): T[];
  getAllWeapons<T>(arg?: WeaponType | ((weapon: AppWeapon) => T)): AppWeapon[] | T[] {
    if (typeof arg === "string") {
      return this.weapons.reduce<AppWeapon[]>((acc, weapon) => {
        if (weapon.data.type === arg) {
          acc.push(weapon.data);
        }
        return acc;
      }, []);
    }
    if (typeof arg === "function") {
      return this.weapons.map((weapon) => arg(weapon.data));
    }

    return this.weapons.map((weapon) => weapon.data);
  }

  getWeapon(code: number) {
    const control = this.getItemControl("weapons", code)!;
    return control!.data;
  }

  // ========== ARTIFACTS ==========
  getAllArtifacts<T>(transform: (data: AppArtifact) => T): T[];
  getAllArtifacts(): AppArtifact[];
  getAllArtifacts<T>(transform?: (data: AppArtifact) => T): T[] | AppArtifact[] {
    return transform
      ? this.artifacts.map((artifact) => transform(artifact.data))
      : this.artifacts.map((artifact) => artifact.data);
  }

  getArtifactSet(code: number) {
    // no artifact with code 0
    return code ? this.getItemControl("artifacts", code)?.data : undefined;
  }

  getArtifact(artifact: { code: number; type: ArtifactType }) {
    const data = this.getArtifactSet(artifact.code);
    if (data && data[artifact.type]) {
      const { name, icon } = data[artifact.type];
      return { beta: data.beta, name, icon };
    }
    return undefined;
  }

  // ========== MONSTERS ==========

  getAllMonsters() {
    return this.monsters;
  }

  getMonster({ code }: { code: number }) {
    return findByCode(this.monsters, code);
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
      const inputConfigs = toArray(monster.inputConfigs);

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
