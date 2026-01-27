import type { AppCharacter, CharacterInnateBuff, ElementType, TravelerConfig } from "@/types";
import type { TravelerProps } from "./types";

import {
  buildResonatedElmtsBuff,
  cannedKnowledgeBuff,
  resonatedElmtsBuff,
  skirksTrainingBuff,
} from "./config";

class AppCharacterService {
  readonly DEFAULT_TRAVELER: TravelerConfig = {
    selection: "LUMINE",
    powerups: {
      cannedKnowledge: false,
      skirksTraining: false,
    },
    resonatedElmts: [],
  };
  characters: AppCharacter[] = [];
  traveler: TravelerConfig = this.DEFAULT_TRAVELER;

  populate(characters: AppCharacter[]) {
    const travelerProps = this.getTravelerProps(this.traveler);

    this.characters = characters.map((character) => {
      return this.updateIfTraveler(character, travelerProps);
    });
  }

  getAll(): AppCharacter[] {
    return this.characters;
  }

  get(name: string) {
    return this.characters.find((character) => character.name === name)!;
  }

  // ==== TRAVELER ====

  checkIsTraveler(obj: { name: string }) {
    return obj.name.slice(-8) === "Traveler";
  }

  private updateIfTraveler(data: AppCharacter, props: TravelerProps) {
    if (data && this.checkIsTraveler(data)) {
      data.icon = props.icon;
      data.sideIcon = props.sideIcon;

      const CA = data.calcList?.CA?.[0];
      if (CA) CA.factor = props.factorsCA;

      syncInnateBuffs(data, props.innateBuffs);
    }

    return data;
  }

  changeTraveler(traveler: TravelerConfig) {
    this.traveler = traveler;

    const travelerProps = this.getTravelerProps(traveler);
    this.characters.forEach((character) => this.updateIfTraveler(character, travelerProps));
  }

  getTravelerProps(traveler: Partial<TravelerConfig>): TravelerProps {
    const { selection, powerups, resonatedElmts } = traveler;

    const innateBuffs: CharacterInnateBuff[] = [];

    if (powerups?.cannedKnowledge) {
      innateBuffs.push(cannedKnowledgeBuff);
    }
    if (powerups?.skirksTraining) {
      innateBuffs.push(skirksTrainingBuff);
    }

    if (resonatedElmts?.length) {
      innateBuffs.push(buildResonatedElmtsBuff(resonatedElmts));
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
}

function syncInnateBuffs(data: AppCharacter, buffs: CharacterInnateBuff[]) {
  const dynamicInnateBuffSources = [
    cannedKnowledgeBuff.src,
    skirksTrainingBuff.src,
    resonatedElmtsBuff.src,
  ];

  const newInnateBuffs = data.innateBuffs?.filter(
    (buff) => !dynamicInnateBuffSources.includes(buff.src)
  );

  data.innateBuffs = buffs.concat(newInnateBuffs || []);
}

export const $AppCharacter = new AppCharacterService();
