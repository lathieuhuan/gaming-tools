import { Character } from "@/models";

export class Member extends Character {
  static fromCharacter(character: Character) {
    return new Member(character.code, character.data, character.weapon, {
      state: character.state,
      atfGear: character.atfGear,
      team: character.team,
      allAttrsCtrl: character.allAttrsCtrl,
      attkBonusCtrl: character.attkBonusCtrl,
    });
  }
}
