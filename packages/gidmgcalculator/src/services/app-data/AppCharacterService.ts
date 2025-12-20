import type { AppCharacter, CharacterInnateBuff, TalentType, TravelerInfo } from "@/types";
import type {
  GenshinDevCharacterSuccessResponse,
  GenshinDevErrorResponse,
  TravelerProps,
} from "./types";

import { GENSHIN_DEV_URL } from "@/constants/config";
import { fetchData } from "./BaseService";
import { cannedKnowledgeBuff, skirksTrainingBuff } from "./config";

const DEFAULT_TRAVELER: TravelerInfo = {
  selection: "LUMINE",
  powerups: {
    cannedKnowledge: false,
    skirksTraining: false,
  },
};

const NO_DESCRIPTION_MSG = "[Description missing]";
let characters_: AppCharacter[] = [];
let traveler_: TravelerInfo = DEFAULT_TRAVELER;

function populate(characters: AppCharacter[]) {
  const travelerProps = getTravelerProps(traveler_);

  characters_ = characters.map((character) => {
    return updateIfTraveler(character, travelerProps);
  });
}

function parseGenshinDevResponse(response: any, appCharacter: AppCharacter) {
  try {
    const { constellation = [], activeTalents, passiveTalents = [] } = appCharacter;
    const consDescriptions: string[] = [];
    const talentDescriptions: string[] = [];

    constellation.forEach((cons, i) => {
      const description = response.constellations[i]?.description || NO_DESCRIPTION_MSG;

      consDescriptions.push(description);
      cons.description = description;
    });

    const processDescription = (talent: TalentType, type: string | undefined) => {
      const description =
        response.skillTalents.find((item: any) => item.type === type)?.description ||
        NO_DESCRIPTION_MSG;

      talentDescriptions.push(description);

      const activeTalent = activeTalents[talent];
      if (activeTalent) activeTalent.description = description;
    };

    processDescription("NAs", "NORMAL_ATTACK");
    processDescription("ES", "ELEMENTAL_SKILL");
    processDescription("EB", "ELEMENTAL_BURST");
    if (activeTalents.altSprint) processDescription("altSprint", undefined);

    response.passiveTalents.forEach((item: any, i: number) => {
      const description = item?.description || NO_DESCRIPTION_MSG;

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

async function fetchConsDescriptions(name: string): Promise<string[]> {
  const appCharacter = get(name);

  if (!appCharacter) {
    throw new Error("Character not found");
  }
  const { constellation = [] } = appCharacter;

  if (!constellation.length) {
    // Aloy
    return [];
  }

  if (constellation[0].description) {
    return constellation.map((cons) => cons.description || NO_DESCRIPTION_MSG);
  }

  const response = await fetchData(GENSHIN_DEV_URL.character(name), {
    processData: (res: GenshinDevCharacterSuccessResponse) => {
      return parseGenshinDevResponse(res, appCharacter).consDescriptions;
    },
    processError: (res: GenshinDevErrorResponse) => res.error,
  });

  if (response.data) {
    return response.data;
  }

  throw new Error(response.message);
}

async function fetchTalentDescriptions(name: string): Promise<string[]> {
  const appCharacter = get(name);

  if (!appCharacter) {
    throw new Error("Character not found");
  }
  const { activeTalents, passiveTalents } = appCharacter;

  if (activeTalents.NAs.description) {
    const coreType: TalentType[] = ["NAs", "ES", "EB"];
    const descriptions: string[] = coreType.map((type) => {
      return activeTalents[type]?.description || NO_DESCRIPTION_MSG;
    });

    if (activeTalents.altSprint) {
      descriptions.push(activeTalents.altSprint.description || NO_DESCRIPTION_MSG);
    }

    descriptions.push(...passiveTalents.map((talent) => talent.description || NO_DESCRIPTION_MSG));

    return descriptions;
  }

  const response = await fetchData(GENSHIN_DEV_URL.character(name), {
    processData: (res) => parseGenshinDevResponse(res, appCharacter).talentDescriptions,
    processError: (res: GenshinDevErrorResponse) => res.error,
  });

  if (response.data) {
    return response.data;
  }

  throw new Error(response.message);
}

function getAll(): AppCharacter[] {
  return characters_;
}

// getStatus(name: string) {
//   const control = this.getControl(name);
//   return control?.status || "unfetched";
// }

function get(name: string) {
  return characters_.find((character) => character.name === name)!;
}

// ==== TRAVELER ====

function checkIsTraveler(obj: { name: string }) {
  return obj.name.slice(-8) === "Traveler";
}

function getTravelerProps(traveler: Partial<TravelerInfo>): TravelerProps {
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
        factorsCA: [55.9, 72.24],
        innateBuffs,
      }
    : {
        name: "Aether",
        icon: "a/a5/Aether_Icon",
        sideIcon: "0/05/Aether_Side_Icon",
        factorsCA: [55.9, 60.72],
        innateBuffs,
      };
}

function syncInnateBuffs(data: AppCharacter, buffs: CharacterInnateBuff[]) {
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
}

function updateIfTraveler(data: AppCharacter, props: TravelerProps) {
  if (data && checkIsTraveler(data)) {
    data.icon = props.icon;
    data.sideIcon = props.sideIcon;

    const CA = data.calcList?.CA?.[0];
    if (CA) CA.factor = props.factorsCA;

    syncInnateBuffs(data, props.innateBuffs);
  }
  return data;
}

function changeTraveler(traveler: TravelerInfo) {
  traveler_ = traveler;

  const travelerProps = getTravelerProps(traveler);
  characters_.forEach((character) => updateIfTraveler(character, travelerProps));
}

export const $AppCharacter = {
  DEFAULT_TRAVELER,
  populate,
  get,
  getAll,
  fetchConsDescriptions,
  fetchTalentDescriptions,
  changeTraveler,
  getTravelerProps,
  checkIsTraveler,
};
