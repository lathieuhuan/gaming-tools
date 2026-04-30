import { AppCharacter } from "@/types";
import { characterMockup } from "../utils/characterMockup";

let code = 0;

export const CharacterMock = {
  /** pyro, sword, mondstadt */
  PYRO_SWORD_HEXEREI: code++,
  ELECTRO_BOW_HEXEREI: code++,
  PYRO_BOW_NODKRAI: code++,
  DENDRO_NODKRAI: code++,
  HYDRO_CATALYST: code++,
  ANEMO_CLAYMORE_LIYUE: code++,
  CRYO_POLEARM: code++,
  GEO_POLEARM: code++,
  TARTAGLIA: 26,
  SKIRK: 105,
};

export const CHARACTER_MOCKS: AppCharacter[] = [
  characterMockup(CharacterMock.PYRO_SWORD_HEXEREI, {
    vision: "pyro",
    weaponType: "sword",
    nation: "mondstadt",
  }),
  characterMockup(CharacterMock.ELECTRO_BOW_HEXEREI, {
    vision: "electro",
    weaponType: "bow",
    nation: "mondstadt",
  }),
  characterMockup(CharacterMock.PYRO_BOW_NODKRAI, {
    vision: "pyro",
    weaponType: "bow",
    nation: "nodkrai",
  }),
  characterMockup(CharacterMock.DENDRO_NODKRAI, {
    vision: "dendro",
    weaponType: "polearm",
    nation: "nodkrai",
  }),
  characterMockup(CharacterMock.HYDRO_CATALYST, {
    vision: "hydro",
    weaponType: "catalyst",
    nation: "sumeru",
  }),
  characterMockup(CharacterMock.ANEMO_CLAYMORE_LIYUE, {
    vision: "anemo",
    weaponType: "claymore",
    nation: "liyue",
  }),
  characterMockup(CharacterMock.CRYO_POLEARM, {
    vision: "cryo",
    weaponType: "polearm",
    nation: "inazuma",
  }),
  characterMockup(CharacterMock.GEO_POLEARM, {
    vision: "geo",
    weaponType: "polearm",
    nation: "fontaine",
  }),
  characterMockup(CharacterMock.TARTAGLIA, {
    vision: "hydro",
    weaponType: "bow",
    nation: "liyue",
  }),
  characterMockup(CharacterMock.SKIRK, {
    vision: "cryo",
    weaponType: "sword",
    nation: "outland",
  }),
];
