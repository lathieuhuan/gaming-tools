import { $AppCharacter } from "../src/services";
import { characters } from "./mocks/characters.mock";

export default async function () {
  $AppCharacter.populate(characters);
}
