import { AppCharacter } from "@/types";
import { __characterMockup } from "../utils/characterMockup";

let code = 0;

export const CharacterMock = {
  /** pyro, sword, mondstadt */
  PYRO_SWORD_HEXEREI: code++,
  ELECTRO_BOW_HEXEREI: code++,
  ANEMO_CLAYMORE_HEXEREI: code++,
  PYRO_BOW_NODKRAI: code++,
  DENDRO_NODKRAI: code++,
  ELECTRO_CATALYST_NODKRAI: code++,
  HYDRO_CATALYST: code++,
  ANEMO_CLAYMORE_LIYUE: code++,
  CRYO_POLEARM: code++,
  GEO_POLEARM: code++,
  TARTAGLIA: 26,
  SKIRK: 105,
};

export const CHARACTER_MOCKS: AppCharacter[] = [
  __characterMockup(CharacterMock.PYRO_SWORD_HEXEREI, {
    vision: "pyro",
    weaponType: "sword",
    nation: "mondstadt",
    enhanceType: "HEXEREI",
  }),
  __characterMockup(CharacterMock.ELECTRO_BOW_HEXEREI, {
    vision: "electro",
    weaponType: "bow",
    nation: "mondstadt",
    enhanceType: "HEXEREI",
  }),
  __characterMockup(CharacterMock.ANEMO_CLAYMORE_HEXEREI, {
    vision: "anemo",
    weaponType: "claymore",
    nation: "mondstadt",
    enhanceType: "HEXEREI",
  }),
  __characterMockup(CharacterMock.PYRO_BOW_NODKRAI, {
    vision: "pyro",
    weaponType: "bow",
    nation: "nodkrai",
    faction: "moonsign",
  }),
  __characterMockup(CharacterMock.DENDRO_NODKRAI, {
    vision: "dendro",
    weaponType: "polearm",
    nation: "nodkrai",
    faction: "moonsign",
  }),
  __characterMockup(CharacterMock.ELECTRO_CATALYST_NODKRAI, {
    vision: "electro",
    weaponType: "catalyst",
    nation: "nodkrai",
    faction: "moonsign",
  }),
  __characterMockup(CharacterMock.HYDRO_CATALYST, {
    vision: "hydro",
    weaponType: "catalyst",
    nation: "sumeru",
  }),
  __characterMockup(CharacterMock.ANEMO_CLAYMORE_LIYUE, {
    vision: "anemo",
    weaponType: "claymore",
    nation: "liyue",
  }),
  __characterMockup(CharacterMock.CRYO_POLEARM, {
    vision: "cryo",
    weaponType: "polearm",
    nation: "inazuma",
  }),
  __characterMockup(CharacterMock.GEO_POLEARM, {
    vision: "geo",
    weaponType: "polearm",
    nation: "fontaine",
  }),
  __characterMockup(CharacterMock.TARTAGLIA, {
    vision: "hydro",
    weaponType: "bow",
    nation: "liyue",
  }),
  __characterMockup(CharacterMock.SKIRK, {
    vision: "cryo",
    weaponType: "sword",
    nation: "outland",
  }),
];
