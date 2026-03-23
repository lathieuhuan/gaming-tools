import { CharacterCalc } from "@/models";
import { CharacterEvent } from "../types";

type CharacterEventViewProps = {
  event: CharacterEvent;
  character: CharacterCalc;
};

export function CharacterEventView({ event, character }: CharacterEventViewProps) {
  switch (event.type) {
    case "SI": {
      return <div>Take the field</div>;
    }

    case "AH": {
      const config = character.data.calcList[event.talent][event.index];

      return <div>{config.name}</div>;
    }

    case "RH": {
      return <div>Reaction Hit</div>;
    }

    case "M": {
      return <div>Modify</div>;
    }

    default: {
      event satisfies never;
      return null;
    }
  }
}
