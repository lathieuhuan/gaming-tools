import { CharacterBuff } from "@Backend";
import { ModifyEvent, SimulationAttributeBonus } from "@Src/types";

export function makeBonuses(mod: CharacterBuff, event: ModifyEvent): SimulationAttributeBonus {
  // const 

  return {
    toStat: "anemo",
    value: 2,
    stable: true,
    trigger: {
      character: "",
      src: "",
    },
  };
}
