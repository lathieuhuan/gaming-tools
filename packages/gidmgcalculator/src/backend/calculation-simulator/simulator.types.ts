import type { Character } from "@Src/types";
import type { AppCharacter } from "../types";
import type { AttackBonusControl, TotalAttributeControl } from "../controls";

export type SimulatorBuffInfoWrap = {
  char: Character;
  appChar: AppCharacter;
  totalAttr: TotalAttributeControl;
  attBonus: AttackBonusControl;
};
