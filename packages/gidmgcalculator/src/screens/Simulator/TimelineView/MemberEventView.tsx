import type { MemberEvent } from "../types";

import { EHitEventType, EModifyEventType } from "../configs";

type MemberEventViewProps = {
  event: MemberEvent;
};

export function MemberEventView({ event }: MemberEventViewProps) {
  const { performer } = event;

  switch (event.type) {
    case "SI": {
      return <div>Take the field</div>;
    }

    case EHitEventType.ABILITY_HIT: {
      const config = performer.calcList[event.talent][event.index];

      return <div>{config.name}</div>;
    }

    case EHitEventType.REACTION_HIT: {
      return <div>Reaction Hit</div>;
    }

    case EModifyEventType.ABILITY_BUFF: {
      return <div>{event.buff.src}</div>;
    }

    case EModifyEventType.WEAPON_BUFF: {
      return <div>{event.item.name}</div>;
    }

    case EModifyEventType.ARTIFACT_SET_BUFF: {
      return <div>{event.item.name}</div>;
    }

    default: {
      event satisfies never;
      return null;
    }
  }
}
