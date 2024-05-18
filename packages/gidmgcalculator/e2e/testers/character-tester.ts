import { Page } from "@playwright/test";
import { Level } from "../../src/backend";
import { startSessionWithCharacter } from "../utils/start-session";
import { CoreTester } from "./core-tester";

export class CharacterTester extends CoreTester {
  constructor(page: Page) {
    super(page);
  }

  selectCharacter = async (name: string, level: Level, constellation: number) => {
    await startSessionWithCharacter(this.page, name, level, constellation);
  };

  activateSelfBuff = async (name: string) => {
    return await this.activateBuff("Self buffs", name);
  };
}
