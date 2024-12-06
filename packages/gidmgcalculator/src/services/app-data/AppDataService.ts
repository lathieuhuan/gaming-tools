import type { AppMonster } from "@Backend";
import type { Target } from "@Src/types";
import type { Metadata, Update } from "./app-data.types";
import type { AppCharacterService } from "./AppCharacterService";
import type { AppWeaponService } from "./AppWeaponService";
import type { AppArtifactService } from "./AppArtifactService";

import { BACKEND_URL, MINIMUM_SYSTEM_VERSION } from "@Src/constants";
import Array_ from "@Src/utils/array-utils";
import { BaseService } from "./BaseService";
import { MetadataChannel } from "./metadata-channel";

type FetchMetadataError = {
  code: number;
  message: string;
  cooldown: number;
};

type MetadataGeneralInfo = {
  version: string;
  updates: Update[];
  supporters: string[];
};

export class AppDataService extends BaseService {
  private readonly COOLDOWN_NORMAL = 30;
  private readonly COOLDOWN_UPGRADE = 15;
  private isFetchedMetadata = false;

  public generalInfo: MetadataGeneralInfo = {
    version: "",
    updates: [],
    supporters: [],
  };
  private monsters: AppMonster[] = [];

  private metadataChannel: MetadataChannel;

  constructor(
    private character$: AppCharacterService,
    private weapon$: AppWeaponService,
    private artifact$: AppArtifactService
  ) {
    super();

    this.metadataChannel = new MetadataChannel();

    this.metadataChannel.onRequest = () => {
      if (this.isFetchedMetadata) {
        this.metadataChannel.response({
          ...this.generalInfo,
          characters: this.character$.getAll(),
          weapons: this.weapon$.getAll(),
          artifacts: this.artifact$.getAll(),
          monsters: this.monsters,
        });
      }
    };

    this.metadataChannel.onResponse = (metadata) => {
      if (!this.isFetchedMetadata) {
        this.populateData(metadata);
      }
    };
  }

  private get currentTime() {
    return Math.round(Date.now() / 1000);
  }
  get secFromLastCheck() {
    const checkTime = localStorage.getItem("lastVersionCheckTime");
    return this.currentTime - (checkTime ? +checkTime : 0);
  }
  private recordVersionCheckTime = () => {
    localStorage.setItem("lastVersionCheckTime", `${this.currentTime}`);
  };
  private removeVersionCheckTime = () => {
    localStorage.removeItem("lastVersionCheckTime");
  };

  private isValidVersion(version: string) {
    const versionFrags = version.split(".");
    const minVersionFrags = MINIMUM_SYSTEM_VERSION.split(".");
    return versionFrags.every((frag, i) => +frag >= +minVersionFrags[i]);
  }

  private populateData = (data: Metadata) => {
    this.isFetchedMetadata = true;
    this.generalInfo = {
      version: data.version,
      updates: data.updates,
      supporters: data.supporters,
    };
    this.monsters = data.monsters;
    this.character$.populate(data.characters);
    this.weapon$.populate(data.weapons);
    this.artifact$.populate(data.artifacts);
  };

  private async _fetchMetadata(isRefetch?: boolean): Promise<FetchMetadataError | null> {
    if (!this.isFetchedMetadata || isRefetch) {
      const response = await this.fetchData<Metadata>(BACKEND_URL.metadata());
      const { code, message = "Error", data } = response;

      if (data) {
        if (this.isValidVersion(data.version)) {
          this.populateData(data);
          this.removeVersionCheckTime();
          return null;
        }

        this.recordVersionCheckTime();

        return {
          code: 503,
          message: "The system is being upgraded",
          cooldown: this.COOLDOWN_UPGRADE,
        };
      }
      return {
        code,
        message,
        cooldown: this.COOLDOWN_NORMAL,
      };
    }

    this.removeVersionCheckTime();
    return null;
  }

  async fetchMetadata(isRefetch?: boolean): Promise<FetchMetadataError | null> {
    const timeElapsed = this.secFromLastCheck;

    if (!isRefetch && timeElapsed < this.COOLDOWN_UPGRADE) {
      return {
        code: 503,
        message: "The system is being upgraded",
        cooldown: this.COOLDOWN_UPGRADE - timeElapsed,
      };
    }

    this.metadataChannel.request();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this._fetchMetadata(isRefetch));
      }, 100);
    });
  }

  close = () => {
    this.metadataChannel.close();
  };

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
