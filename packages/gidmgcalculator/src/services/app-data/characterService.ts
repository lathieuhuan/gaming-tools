import { AppCharacter, CharacterInnateBuff, ElementType, TravelerConfig } from "@/types";
import { getCachedAppData } from "./selector";

import { TRAVELER_RESONATED_ELEMENTS } from "@/constants/settings";
import { characterCache } from "./cache";
import {
  AETHER_PROPS,
  cannedKnowledgeBuff,
  LUMINE_PROPS,
  resonatedElmtsBuff,
  skirksTrainingBuff,
  type TravelerProps,
} from "./characterService.constants";

export function getAppCharacters(): AppCharacter[] {
  return getCachedAppData()?.characters || [];
}

export function getAppCharacter(code: number) {
  const cached = characterCache.get(code);

  if (cached) {
    return cached;
  }

  const data = getAppCharacters().find((character) => character.code === code);

  if (data) {
    characterCache.set(code, data);
  }

  return data!;
}

// ==== TRAVELER ====

export function checkIsTraveler(obj: { code: number }) {
  const character = getAppCharacter(obj.code);
  return character?.name.slice(-8) === "Traveler";
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

export function changeTraveler(traveler: TravelerConfig) {
  const travelerProps = getTravelerProps(traveler);

  getAppCharacters().forEach((character) => updateIfTraveler(character, travelerProps));
}

export function getTravelerProps(traveler: Partial<TravelerConfig>): TravelerProps {
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

  const travelerProps = selection === "AETHER" ? AETHER_PROPS : LUMINE_PROPS;

  return {
    ...travelerProps,
    innateBuffs,
  };
}

function syncInnateBuffs(data: AppCharacter, buffs: CharacterInnateBuff[]) {
  const dynamicInnateBuffSources = [
    cannedKnowledgeBuff.src,
    skirksTrainingBuff.src,
    resonatedElmtsBuff.src,
  ];

  const newInnateBuffs = data.innateBuffs?.filter(
    (buff) => !dynamicInnateBuffSources.includes(buff.src),
  );

  data.innateBuffs = buffs.concat(newInnateBuffs || []);
}

function buildResonatedElmtsBuff(resonatedElmts: ElementType[]): CharacterInnateBuff {
  let finalDesc = resonatedElmtsBuff.description;
  const finalEffects: CharacterInnateBuff["effects"] = [];

  for (const elmt of TRAVELER_RESONATED_ELEMENTS) {
    const activated = resonatedElmts.includes(elmt);
    const { description, effects } = resonatedElmtsBuff.items[elmt];
    const decorDesc = `<span class="${activated ? "" : "opacity-50"}">• ${description}</span>`;

    finalDesc = `${finalDesc}<br />${decorDesc}`;
    activated && finalEffects.push(effects);
  }

  return {
    src: resonatedElmtsBuff.src,
    description: finalDesc,
    effects: finalEffects,
  };
}
