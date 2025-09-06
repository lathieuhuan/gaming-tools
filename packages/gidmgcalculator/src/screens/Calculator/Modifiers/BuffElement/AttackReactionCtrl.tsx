import { AmplifyingReaction, AttackBonuses, AttackElement, Level, QuickenReaction } from "@Calculation";

import { ElementModCtrl } from "@/types";
import { updateCalcSetup } from "@Store/calculator-slice";
import { useDispatch } from "@Store/hooks";

import { QuickenBuffItem, VapMeltBuffItem } from "@/components";

type ReactionConfigType = "reaction" | "infuse_reaction" | "absorb_reaction";

type AttackReactionCtrlProps = {
  attackElmt: AttackElement | null;
  configType: ReactionConfigType;
  elmtModCtrls: ElementModCtrl;
  attkBonuses: AttackBonuses;
  characterLv: Level;
};

export function AttackReactionCtrl({
  attackElmt,
  configType,
  elmtModCtrls,
  attkBonuses,
  characterLv,
}: AttackReactionCtrlProps) {
  const selectedReaction = elmtModCtrls[configType];
  const dispatch = useDispatch();

  const handleToggleAmplifying = (reaction: AmplifyingReaction) => {
    dispatch(
      updateCalcSetup({
        elmtModCtrls: {
          ...elmtModCtrls,
          [configType]: selectedReaction === reaction ? null : reaction,
        },
      })
    );
  };

  const handleToggleQuicken = (reaction: QuickenReaction) => {
    dispatch(
      updateCalcSetup({
        elmtModCtrls: {
          ...elmtModCtrls,
          [configType]: selectedReaction === reaction ? null : reaction,
        },
      })
    );
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
            attkBonuses={attkBonuses}
            onToggle={() => handleToggleAmplifying("melt")}
          />
          <VapMeltBuffItem
            mutable
            checked={selectedReaction === "vaporize"}
            reaction="vaporize"
            element={attackElmt}
            attkBonuses={attkBonuses}
            onToggle={() => handleToggleAmplifying("vaporize")}
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
          attkBonuses={attkBonuses}
          onToggle={() => handleToggleAmplifying("melt")}
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
          attkBonuses={attkBonuses}
          onToggle={() => handleToggleAmplifying("vaporize")}
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
          attkBonuses={attkBonuses}
          characterLv={characterLv}
          onToggle={() => handleToggleQuicken("aggravate")}
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
          attkBonuses={attkBonuses}
          characterLv={characterLv}
          onToggle={() => handleToggleQuicken("spread")}
        />
      );
    }
    default:
      return null;
  }
}
