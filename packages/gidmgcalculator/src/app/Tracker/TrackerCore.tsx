import { useLayoutEffect, useState } from "react";
import { CollapseList, CollapseListProps } from "rond";

import type { AttackPattern } from "@/types";
import type { TrackerState } from "@Store/ui-slice";

import { calculateSetup } from "@/calculation-new/calculator";
import { selectSetup } from "@Store/calculator/selectors";

// Component
import { markDim, markGreen } from "@/components";
import { useShallowCalcStore } from "@Store/calculator";
import { AttributesTracker } from "./AttributesTracker";
import { BonusesTracker } from "./BonusesTracker";
import { CalcItemTracker } from "./CalcItemTracker";
import { DebuffsTracker } from "./DebuffsTracker";

type TrackerCoreProps = {
  trackerState: TrackerState;
};

export function TrackerCore({ trackerState }: TrackerCoreProps) {
  const activeSetup = useShallowCalcStore(selectSetup);
  const [state, setState] = useState<ReturnType<typeof calculateSetup>>();

  useLayoutEffect(() => {
    if (trackerState === "open") {
      const state = calculateSetup(activeSetup, { shouldRecord: true });

      console.log("state", state);

      setState(state);
    }
  }, [trackerState]);

  if (!state) {
    return null;
  }

  const { result, target } = state;
  const { attkBonusCtrl, totalAttrCtrl } = state.main;
  const charLv = activeSetup.char.bareLv;
  const totalDefReduct = target.getReduction("def").value;

  const renderDefMultiplier = (talent: AttackPattern | "WP") => {
    const totalDefIgnore =
      attkBonusCtrl.get("defIgn_", "all") +
      (talent === "WP" ? 0 : attkBonusCtrl.get("defIgn_", talent));

    return (
      <div className="flex items-center">
        <p className="mr-4 text-primary-1">DEF Mult.</p>

        <div className="text-sm flex flex-col items-center">
          <p>
            {markDim("char. Lv.")} {markGreen(charLv)} + 100
          </p>

          <div className="my-1 w-full h-px bg-rarity-1" />

          <p className="px-2 text-center">
            {totalDefReduct ? (
              <>
                (1 - {markDim("DEF reduction")} {markGreen(totalDefReduct)} / 100) *
              </>
            ) : null}{" "}
            {totalDefIgnore ? (
              <>
                (1 - {markDim("DEF ignore")} {markGreen(totalDefIgnore)} / 100) *
              </>
            ) : null}{" "}
            ({markDim("target Lv.")} {markGreen(target.level)} + 100) + {markDim("char. Lv.")}{" "}
            {markGreen(charLv)} + 100
          </p>
        </div>
      </div>
    );
  };

  const listClassName = "columns-1 md:columns-2 space-y-1";

  const collapseItems: CollapseListProps["items"] = [
    {
      heading: "Attributes",
      body: <AttributesTracker listClassName={listClassName} totalAttrCtrl={totalAttrCtrl} />,
    },
    {
      heading: "Bonuses",
      body: <BonusesTracker listClassName={listClassName} attkBonusCtrl={attkBonusCtrl} />,
    },
    {
      heading: "Debuffs on Target",
      body: <DebuffsTracker listClassName={listClassName} target={target} />,
    },
    {
      heading: "Normal Attacks",
      body: (
        <CalcItemTracker
          resultGroup={result.NAs}
          attkBonusCtrl={attkBonusCtrl}
          defMultDisplay={renderDefMultiplier("NA")}
        />
      ),
    },
    {
      heading: "Elemental Skill",
      body: (
        <CalcItemTracker
          resultGroup={result.ES}
          attkBonusCtrl={attkBonusCtrl}
          defMultDisplay={renderDefMultiplier("ES")}
        />
      ),
    },
    {
      heading: "Elemental Burst",
      body: (
        <CalcItemTracker
          resultGroup={result.EB}
          attkBonusCtrl={attkBonusCtrl}
          defMultDisplay={renderDefMultiplier("EB")}
        />
      ),
    },
    {
      heading: "Reactions",
      body: <CalcItemTracker resultGroup={result.RXN} attkBonusCtrl={attkBonusCtrl} forReactions />,
    },
  ];

  if (Object.keys(result.WP).length) {
    collapseItems.push({
      heading: "Weapon",
      body: (
        <CalcItemTracker
          resultGroup={result.WP}
          attkBonusCtrl={attkBonusCtrl}
          defMultDisplay={renderDefMultiplier("WP")}
        />
      ),
    });
  }

  return (
    <div
      className="h-full custom-scrollbar cursor-default"
      onDoubleClick={() => console.log(result)}
    >
      <CollapseList items={collapseItems} />
    </div>
  );
}
