import { AppCharacter } from "@/types";
import { __appCharacterMock } from "../utils/appCharacterMock";

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
  __appCharacterMock(CharacterMock.PYRO_SWORD_HEXEREI, {
    vision: "pyro",
    weaponType: "sword",
    nation: "mondstadt",
    enhanceType: "HEXEREI",
  }),
  __appCharacterMock(CharacterMock.ELECTRO_BOW_HEXEREI, {
    vision: "electro",
    weaponType: "bow",
    nation: "mondstadt",
    enhanceType: "HEXEREI",
  }),
  __appCharacterMock(CharacterMock.ANEMO_CLAYMORE_HEXEREI, {
    vision: "anemo",
    weaponType: "claymore",
    nation: "mondstadt",
    enhanceType: "HEXEREI",
  }),
  __appCharacterMock(CharacterMock.PYRO_BOW_NODKRAI, {
    vision: "pyro",
    weaponType: "bow",
    nation: "nodkrai",
    faction: "moonsign",
  }),
  __appCharacterMock(CharacterMock.DENDRO_NODKRAI, {
    vision: "dendro",
    weaponType: "polearm",
    nation: "nodkrai",
    faction: "moonsign",
  }),
  __appCharacterMock(CharacterMock.ELECTRO_CATALYST_NODKRAI, {
    vision: "electro",
    weaponType: "catalyst",
    nation: "nodkrai",
    faction: "moonsign",
  }),
  __appCharacterMock(CharacterMock.HYDRO_CATALYST, {
    vision: "hydro",
    weaponType: "catalyst",
    nation: "sumeru",
  }),
  __appCharacterMock(CharacterMock.ANEMO_CLAYMORE_LIYUE, {
    vision: "anemo",
    weaponType: "claymore",
    nation: "liyue",
  }),
  __appCharacterMock(CharacterMock.CRYO_POLEARM, {
    vision: "cryo",
    weaponType: "polearm",
    nation: "inazuma",
  }),
  __appCharacterMock(CharacterMock.GEO_POLEARM, {
    vision: "geo",
    weaponType: "polearm",
    nation: "fontaine",
  }),
  __appCharacterMock(CharacterMock.TARTAGLIA, {
    vision: "hydro",
    weaponType: "bow",
    nation: "liyue",
  }),
  __appCharacterMock(CharacterMock.SKIRK, {
    vision: "cryo",
    weaponType: "sword",
    nation: "outland",
  }),
];
