import { Page } from "@playwright/test";
import { Level } from "../../src/backend";
import { startSessionWithCharacter } from "../utils/start-session";
import { CoreTester } from "./core-tester";

export class CharacterTester extends CoreTester {
  constructor(page: Page) {
    super(page);
  }

  selectCharacter = async (name: string, level: Level) => {
    await startSessionWithCharacter(this.page, name, level);
  };

  activateSelfBuff = async (name: string) => {
    await this.activateBuff("Self buffs", name);
  };
}
