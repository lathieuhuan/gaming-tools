import { $AppCharacter } from "../src/services";
import { __characters } from "./mocks/characters.mock";

export default async function () {
  $AppCharacter.populate(__characters);
}
