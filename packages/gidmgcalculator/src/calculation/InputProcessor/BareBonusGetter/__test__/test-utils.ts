import { __EMockCharacter } from "@UnitTest/mocks/characters.mock";
import { __genMutableTeamDataTester, MutableTeamDataTester } from "@UnitTest/test-utils";
import { TotalAttributeControl } from "../../TotalAttributeControl";
import { BareBonusGetter } from "../BareBonusGetter";
import { Character } from "@Src/types";

export class BareBonusGetterTester extends BareBonusGetter<MutableTeamDataTester> {
  inputs: number[] = [];

  constructor(totalAttrCtrl?: TotalAttributeControl);
  constructor(info?: MutableTeamDataTester, totalAttrCtrl?: TotalAttributeControl);
  constructor(info?: MutableTeamDataTester | TotalAttributeControl, totalAttrCtrl?: TotalAttributeControl) {
    const _info = !info || info instanceof TotalAttributeControl ? __genMutableTeamDataTester() : info;
    const _totalAttrCtrl = info instanceof TotalAttributeControl ? info : totalAttrCtrl;

    super(true, _info, _totalAttrCtrl);
  }

  __changeActiveMember(characterName: __EMockCharacter) {
    this.teamData.__changeActiveMember(characterName);
  }

  __updateActiveMember(data: Partial<Character>) {
    this.teamData.__updateActiveMember(data);
  }

  __changeFromSelf(fromSelf: boolean) {
    this.fromSelf = fromSelf;
  }

  __changeTeammates(names: string[]) {
    this.teamData.__changeTeammates(names);
  }
}
