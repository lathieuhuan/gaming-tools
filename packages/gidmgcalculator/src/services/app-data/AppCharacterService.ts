import { AppCharacter, TalentType } from "@Calculation";

import type { Character, Traveler } from "@/types";
import type { GOODCharacter } from "@/types/GOOD.types";
import type { StandardResponse } from "../services.types";
import type { DataControl, ServiceSubscriber } from "./app-data.types";

import { BACKEND_URL, GENSHIN_DEV_URL } from "@/constants";
import { BaseService } from "./BaseService";
import { convertGOODLevel } from "./utils";

type CharacterSubscriber = ServiceSubscriber<AppCharacter>;

export type ConvertedCharacter = Character & { data: AppCharacter };

export class AppCharacterService extends BaseService {
  private readonly NO_DESCRIPTION_MSG = "[Description missing]";
  private characters: Array<DataControl<AppCharacter>> = [];
  private subscribers: Map<string, Set<CharacterSubscriber>> = new Map();
  private traveler: Traveler = "LUMINE";

  populate(characters: AppCharacter[]) {
    this.characters = characters.map((character) => ({
      status: "fetched",
      data: this.updateIfTraveler(character, this.traveler),
    }));
  }

  private getControl(name: string) {
    return this.characters.find((character) => character.data.name === name);
  }

  public subscribe(name: string, subscriber: CharacterSubscriber) {
    const existSubscribers = this.subscribers.get(name);

    if (existSubscribers) {
      existSubscribers.add(subscriber);
    } else {
      this.subscribers.set(name, new Set([subscriber]));
    }

    return () => this.unsubscribe(name, subscriber);
  }

  private unsubscribe(name: string, subscriber: CharacterSubscriber) {
    this.subscribers.get(name)?.delete(subscriber);
  }

  async fetch(name: string): StandardResponse<AppCharacter> {
    const control = this.getControl(name);

    if (!control) {
      return {
        code: 404,
        message: "Character not found",
        data: null,
      };
    }
    if (control.status === "fetched") {
      return {
        code: 200,
        data: control.data,
      };
    }

    control.status = "fetching";
    const response = await this.fetchData<AppCharacter>(BACKEND_URL.character.byName(name));

    if (response.data) {
      control.status = "fetched";
      Object.assign(control.data, response.data);

      const subscribers = this.subscribers.get(name);

      if (subscribers) {
        subscribers.forEach((subscriber) => {
          subscriber(control.data);
        });
      }

      return {
        ...response,
        data: control.data,
      };
    }

    return response;
  }

  private parseGenshinDevResponse(response: any, appCharacter: AppCharacter) {
    try {
      const { constellation = [], activeTalents, passiveTalents = [] } = appCharacter;
      const consDescriptions: string[] = [];
      const talentDescriptions: string[] = [];

      constellation.forEach((cons, i) => {
        const description = response.constellations[i]?.description || this.NO_DESCRIPTION_MSG;
        consDescriptions.push(description);
        cons.description = description;
      });

      const processDescription = (talent: TalentType, type: string | undefined) => {
        const description =
          response.skillTalents.find((item: any) => item.type === type)?.description || this.NO_DESCRIPTION_MSG;
        talentDescriptions.push(description);

        const activeTalent = activeTalents[talent];
        if (activeTalent) activeTalent.description = description;
      };

      processDescription("NAs", "NORMAL_ATTACK");
      processDescription("ES", "ELEMENTAL_SKILL");
      processDescription("EB", "ELEMENTAL_BURST");
      if (activeTalents.altSprint) processDescription("altSprint", undefined);

      response.passiveTalents.forEach((item: any, i: number) => {
        const description = item?.description || this.NO_DESCRIPTION_MSG;
        talentDescriptions.push(description);

        if (passiveTalents[i]) passiveTalents[i].description = description;
      });

      return {
        consDescriptions,
        talentDescriptions,
      };
    } catch (e) {
      console.error(e);
      throw new Error("Internal Error");
    }
  }

  async fetchConsDescriptions(name: string): StandardResponse<string[]> {
    const appCharacter = this.get(name);
    if (!appCharacter) {
      return {
        code: 404,
        message: "Character not found",
        data: null,
      };
    }
    const { constellation = [] } = appCharacter;

    if (!constellation.length || !constellation[0]) {
      // Aloy
      return { code: 200, data: [] };
    }

    if (constellation[0].description) {
      return {
        code: 200,
        data: constellation.map((cons) => cons.description || this.NO_DESCRIPTION_MSG),
      };
    }

    return await this.fetchData(GENSHIN_DEV_URL.character(name), {
      processData: (res) => this.parseGenshinDevResponse(res, appCharacter).consDescriptions,
      processError: (res) => res.error,
    });
  }

  async fetchTalentDescriptions(name: string): StandardResponse<string[]> {
    const appCharacter = this.get(name);
    if (!appCharacter) {
      return {
        code: 404,
        message: "Character not found",
        data: null,
      };
    }
    const { activeTalents, passiveTalents } = appCharacter;

    if (activeTalents.NAs.description) {
      const coreType: TalentType[] = ["NAs", "ES", "EB"];
      const descriptions: string[] = coreType.map((type) => {
        return activeTalents[type]?.description || this.NO_DESCRIPTION_MSG;
      });

      if (activeTalents.altSprint) descriptions.push(activeTalents.altSprint.description || this.NO_DESCRIPTION_MSG);

      descriptions.push(...passiveTalents.map((talent) => talent.description || this.NO_DESCRIPTION_MSG));

      return {
        code: 200,
        data: descriptions,
      };
    }

    return await this.fetchData(GENSHIN_DEV_URL.character(name), {
      processData: (res) => this.parseGenshinDevResponse(res, appCharacter).talentDescriptions,
      processError: (res) => res.error,
    });
  }

  getAll(): AppCharacter[] {
    return this.characters.map((control) => control.data);
  }

  getStatus(name: string) {
    const control = this.getControl(name);
    return control?.status || "unfetched";
  }

  get(name: string) {
    const control = this.getControl(name);
    return control!.data;
  }

  isTraveler = (obj: { name: string }) => {
    return obj.name.slice(-8) === "Traveler";
  };

  getTravelerProps = (traveler: Traveler) => {
    return traveler === "LUMINE"
      ? {
          icon: "9/9c/Lumine_Icon",
          sideIcon: "9/9a/Lumine_Side_Icon",
          multFactorsCA: [55.9, 72.24],
        }
      : {
          icon: "a/a5/Aether_Icon",
          sideIcon: "0/05/Aether_Side_Icon",
          multFactorsCA: [55.9, 60.72],
        };
  };

  private updateIfTraveler = (data: AppCharacter, traveler: Traveler) => {
    if (data && this.isTraveler(data)) {
      const props = this.getTravelerProps(traveler);
      data.icon = props.icon;
      data.sideIcon = props.sideIcon;

      const CA = data.calcList?.CA?.[0];
      if (CA) CA.multFactors = props.multFactorsCA;
    }
    return data;
  };

  changeTraveler(traveler: Traveler) {
    this.characters.forEach((control) => this.updateIfTraveler(control.data, traveler));
    this.traveler = traveler;
  }

  convertGOOD(character: GOODCharacter): ConvertedCharacter | undefined {
    const data = this.characters.find(({ data }) => data.name === character.key || data.GOOD === character.key)?.data;

    if (!data) {
      return undefined;
    }

    return {
      name: data.name,
      level: convertGOODLevel(character),
      cons: character.constellation,
      NAs: character.talent.auto,
      ES: character.talent.skill,
      EB: character.talent.burst,
      data,
    };
  }
}
