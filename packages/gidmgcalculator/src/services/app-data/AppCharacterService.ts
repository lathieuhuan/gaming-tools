import { AppCharacter, CharacterInnateBuff, TalentType } from "@Calculation";

import type { Character, TravelerInfo } from "@/types";
import type { GOODCharacter } from "@/types/GOOD.types";
import type { StandardResponse } from "../services.types";
import type { DataControl, ServiceSubscriber, TravelerProps } from "./app-data.types";

import { BACKEND_URL, DEFAULT_TRAVELER, GENSHIN_DEV_URL } from "@/constants";
import { BaseService } from "./BaseService";
import { cannedKnowledgeBuff, skirksTrainingBuff } from "./config";
import { convertGOODLevel } from "./utils";

type CharacterSubscriber = ServiceSubscriber<AppCharacter>;

export type ConvertedCharacter = Character & { data: AppCharacter };

export class AppCharacterService extends BaseService {
  private readonly NO_DESCRIPTION_MSG = "[Description missing]";
  private characters: Array<DataControl<AppCharacter>> = [];
  private subscribers: Map<string, Set<CharacterSubscriber>> = new Map();
  private traveler = DEFAULT_TRAVELER;

  populate(characters: AppCharacter[]) {
    this.characters = characters.map((character) => ({
      status: "fetched",
      data: this.updateIfTraveler(character),
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

  // ==== TRAVELER ====

  checkIsTraveler = (obj: { name: string }) => {
    return obj.name.slice(-8) === "Traveler";
  };

  getTravelerProps = (traveler: Partial<TravelerInfo>): TravelerProps => {
    const { selection, powerups } = traveler;

    const innateBuffs: TravelerProps["innateBuffs"] = [];

    if (powerups?.cannedKnowledge) {
      innateBuffs.push(cannedKnowledgeBuff);
    }
    if (powerups?.skirksTraining) {
      innateBuffs.push(skirksTrainingBuff);
    }

    return selection === "LUMINE"
      ? {
          name: "Lumine",
          icon: "9/9c/Lumine_Icon",
          sideIcon: "9/9a/Lumine_Side_Icon",
          multFactorsCA: [55.9, 72.24],
          innateBuffs,
        }
      : {
          name: "Aether",
          icon: "a/a5/Aether_Icon",
          sideIcon: "0/05/Aether_Side_Icon",
          multFactorsCA: [55.9, 60.72],
          innateBuffs,
        };
  };

  private syncInnateBuffs = (data: AppCharacter, buffs: CharacterInnateBuff[]) => {
    if (data.name !== "Anemo Traveler") {
      return;
    }

    const removedSrcs: string[] = [];
    const addedBuffs: CharacterInnateBuff[] = [];

    for (const src of [cannedKnowledgeBuff.src, skirksTrainingBuff.src]) {
      const addedBuff = buffs.find((buff) => buff.src === src);

      if (addedBuff) {
        if (!data.innateBuffs?.some((buff) => buff.src === src)) {
          addedBuffs.push(addedBuff);
        }
      } else {
        removedSrcs.push(src);
      }
    }

    data.innateBuffs = data.innateBuffs?.filter((buff) => !removedSrcs.includes(buff.src));
    data.innateBuffs = addedBuffs.concat(data.innateBuffs || []);
  };

  private updateIfTraveler = (data: AppCharacter) => {
    if (data && this.checkIsTraveler(data)) {
      const props = this.getTravelerProps(this.traveler);
      data.icon = props.icon;
      data.sideIcon = props.sideIcon;

      const CA = data.calcList?.CA?.[0];
      if (CA) CA.multFactors = props.multFactorsCA;

      // this.syncInnateBuffs(data, props.innateBuffs);
    }
    return data;
  };

  changeTraveler(traveler: TravelerInfo) {
    this.traveler = traveler;
    this.characters.forEach((control) => this.updateIfTraveler(control.data));
  }

  // ==== CONVERT GOOD ====

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
