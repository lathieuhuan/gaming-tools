import type { AppCharacter, Party, PartyData, Talent } from "@Src/types";
import type { StandardResponse } from "../services.types";
import type { DataControl, ServiceSubscriber } from "./app-data.types";

import { BACKEND_URL, GENSHIN_DEV_URL } from "@Src/constants";
import { pickProps } from "@Src/utils";
import { BaseService } from "./BaseService";

type CharacterSubscriber = ServiceSubscriber<AppCharacter>;

export class AppCharacterService extends BaseService {
  private readonly NO_DESCRIPTION_MSG = "[Description missing]";
  private characters: Array<DataControl<AppCharacter>> = [];
  private subscribers: Map<string, Set<CharacterSubscriber>> = new Map();

  constructor() {
    super();
    // this.characters = characters.map((character) => ({
    //   status: "fetched",
    //   data: character,
    // }));
  }

  populateCharacters(characters: AppCharacter[]) {
    this.characters = characters.map((character) => ({
      status: "fetched",
      data: character,
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

      const processDescription = (talent: Talent, type: string | undefined) => {
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
    const appChar = this.get(name);
    if (!appChar) {
      return {
        code: 404,
        message: "Character not found",
        data: null,
      };
    }
    const { constellation = [] } = appChar;

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
      processData: (res) => this.parseGenshinDevResponse(res, appChar).consDescriptions,
      processError: (res) => res.error,
    });
  }

  async fetchTalentDescriptions(name: string): StandardResponse<string[]> {
    const appChar = this.get(name);
    if (!appChar) {
      return {
        code: 404,
        message: "Character not found",
        data: null,
      };
    }
    const { activeTalents, passiveTalents } = appChar;

    if (activeTalents.NAs.description) {
      const coreType: Talent[] = ["NAs", "ES", "EB"];
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
      processData: (res) => this.parseGenshinDevResponse(res, appChar).talentDescriptions,
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

  getPartyData(party: Party): PartyData {
    return party.map((teammate) => {
      if (teammate) {
        const keys: Array<keyof AppCharacter> = ["code", "name", "icon", "nation", "vision", "weaponType", "EBcost"];
        return pickProps(this.getControl(teammate.name)!.data, keys);
      }
      return null;
    });
  }
}
