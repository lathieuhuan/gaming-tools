import type { Character } from "@/models";
import type { CharacterEvent } from "../types";

type CharacterEventViewProps = {
  event: CharacterEvent;
  character: Character;
};

export function CharacterEventView({ event, character }: CharacterEventViewProps) {
  const { data } = character;

  switch (event.type) {
    case "SI": {
      return <div>Take the field</div>;
    }

    case "AH": {
      const config = data.calcList[event.talent][event.index];

      return <div>{config.name}</div>;
    }

    case "RH": {
      return <div>Reaction Hit</div>;
    }

    case "AB": {
      const buff = data.buffs?.find((buff) => buff.index === event.modId);

      if (!buff) {
        return null;
      }

      return <div>{buff.src}</div>;
    }

    case "WB": {
      return <div>Weapon Buff</div>;
    }

    default: {
      event satisfies never;
      return null;
    }
  }
}
