import { useLayoutEffect, useState } from "react";
import { Object_ } from "ron-utils";
import { CollapseList, CollapseListProps } from "rond";

import type { AttackPattern } from "@/types";
import type { TrackerState } from "@Store/ui";

import { calculateSetup } from "@/calculation/calculator";
import { useShallowCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";
import { useSettingsStore } from "@Store/settings";

// Component
import { markDim, markGreen } from "@/components";
import { AttributeTracker } from "./AttributeTracker";
import { BonusTracker } from "./BonusTracker";
import { CalcItemTracker } from "./CalcItemTracker";
import { ReactionTracker } from "./CalcItemTracker/ReactionTracker";
import { DebuffTracker } from "./DebuffTracker";

type TrackerCoreProps = {
  trackerState: TrackerState;
};

export function TrackerCore({ trackerState }: TrackerCoreProps) {
  const activeSetup = useShallowCalcStore(selectSetup);
  const [state, setState] = useState<ReturnType<typeof calculateSetup>>();
  const resonatedElmts = useSettingsStore((state) => state.traveler.resonatedElmts);

  useLayoutEffect(() => {
    if (trackerState === "open") {
      const state = calculateSetup(activeSetup, {
        shouldLog: true,
        resonatedElmts,
      });

      setState(state);
    }
  }, [trackerState, resonatedElmts]);

  if (!state) {
    return null;
  }

  const { result, target } = state;
  const { attkBonusCtrl, allAttrsCtrl } = state.main;
  const charLv = activeSetup.main.bareLv;
  const totalDefReduct = target.getReduction("def").value;

  const renderDefMultiplier = (talent: AttackPattern | "WP" | "XTRA") => {
    const totalDefIgnore =
      attkBonusCtrl.get("defIgn_", ["all"]) +
      (talent === "WP" || talent === "XTRA" ? 0 : attkBonusCtrl.get("defIgn_", [talent]));

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
      body: <AttributeTracker listClassName={listClassName} allAttrsCtrl={allAttrsCtrl} />,
    },
    {
      heading: "Bonuses",
      body: <BonusTracker listClassName={listClassName} attkBonusCtrl={attkBonusCtrl} />,
    },
    {
      heading: "Debuffs on Target",
      body: <DebuffTracker listClassName={listClassName} target={target} />,
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
  ];

  if (Object.keys(result.XTRA).length) {
    collapseItems.push({
      heading: "Extra",
      body: (
        <CalcItemTracker
          resultGroup={result.XTRA}
          attkBonusCtrl={attkBonusCtrl}
          defMultDisplay={renderDefMultiplier("XTRA")}
        />
      ),
    });
  }

  collapseItems.push({
    heading: "Reactions",
    body: (
      <div className="space-y-1">
        {Object_.entries(result.RXN).map(([title, item]) => (
          <ReactionTracker key={title} title={title} item={item} />
        ))}
      </div>
    ),
  });

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
      onDoubleClick={() => console.info(state)}
    >
      <CollapseList items={collapseItems} />
    </div>
  );
}
