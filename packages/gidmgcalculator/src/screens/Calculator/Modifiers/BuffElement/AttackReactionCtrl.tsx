import type { CalcCharacter } from "@/models/base";
import type { AttackElement, AttackReaction, ElementalEvent } from "@/types";

import { QuickenBuffItem, VapMeltBuffItem } from "@/components";
import { updateElementalEvent } from "@Store/calculator/actions";

type ReactionConfigType = "reaction" | "infuseReaction" | "absorbReaction";

type AttackReactionCtrlProps = {
  attackElmt: AttackElement | null;
  configType: ReactionConfigType;
  character: CalcCharacter;
  elmtEvent: ElementalEvent;
};

export function AttackReactionCtrl({
  attackElmt,
  configType,
  character,
  elmtEvent,
}: AttackReactionCtrlProps) {
  const selectedReaction = elmtEvent[configType];

  const handleToggle = (reaction: AttackReaction) => {
    updateElementalEvent({
      [configType]: selectedReaction === reaction ? null : reaction,
    });
  };

  switch (attackElmt) {
    case "pyro": {
      return (
        <>
          <VapMeltBuffItem
            mutable
            checked={selectedReaction === "melt"}
            reaction="melt"
            element={attackElmt}
            character={character}
            onToggle={() => handleToggle("melt")}
          />
          <VapMeltBuffItem
            mutable
            checked={selectedReaction === "vaporize"}
            reaction="vaporize"
            element={attackElmt}
            character={character}
            onToggle={() => handleToggle("vaporize")}
          />
        </>
      );
    }
    case "cryo": {
      return (
        <VapMeltBuffItem
          mutable
          checked={selectedReaction === "melt"}
          reaction="melt"
          element={attackElmt}
          character={character}
          onToggle={() => handleToggle("melt")}
        />
      );
    }
    case "hydro": {
      return (
        <VapMeltBuffItem
          mutable
          checked={selectedReaction === "vaporize"}
          reaction="vaporize"
          element={attackElmt}
          character={character}
          onToggle={() => handleToggle("vaporize")}
        />
      );
    }
    case "electro": {
      return (
        <QuickenBuffItem
          mutable
          checked={selectedReaction === "aggravate"}
          reaction="aggravate"
          element={attackElmt}
          character={character}
          onToggle={() => handleToggle("aggravate")}
        />
      );
    }
    case "dendro": {
      return (
        <QuickenBuffItem
          mutable
          checked={selectedReaction === "spread"}
          reaction="spread"
          element={attackElmt}
          character={character}
          onToggle={() => handleToggle("spread")}
        />
      );
    }
    default:
      return null;
  }
}
