import { Character } from "@Src/types";
import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genCharacterDataTester, CharacterDataTester } from "@UnitTest/test-utils";
import { TotalAttributeControl } from "../../TotalAttributeControl";
import { BareBonusGetter } from "../BareBonusGetter";

export class BareBonusGetterTester extends BareBonusGetter<CharacterDataTester> {
  inputs: number[] = [];
  fromSelf = true;

  constructor(totalAttrCtrl?: TotalAttributeControl);
  constructor(info?: CharacterDataTester, totalAttrCtrl?: TotalAttributeControl);
  constructor(info?: CharacterDataTester | TotalAttributeControl, totalAttrCtrl?: TotalAttributeControl) {
    const _info = !info || info instanceof TotalAttributeControl ? __genCharacterDataTester() : info;
    const _totalAttrCtrl = info instanceof TotalAttributeControl ? info : totalAttrCtrl;

    super(_info, _totalAttrCtrl);
  }

  __updateCharacter<TKey extends keyof Character>(key: TKey, value: Character[TKey]) {
    this.characterData.character[key] = value;
  }

  __changeCharacter(characterName: __EMockCharacter) {
    this.characterData.__updateCharacter(characterName);
  }

  __changeParty(names: string[]) {
    this.characterData.__updateParty(names);
  }
}
