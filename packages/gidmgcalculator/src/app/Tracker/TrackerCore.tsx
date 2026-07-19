import { useLayoutEffect, useState } from "react";
import { CollapseList, CollapseListProps } from "rond";

import type { TrackerState } from "@Store/ui";

import { calculateSetup } from "@/calculation/calculator";
import { useShallowCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";
import { useSettingsStore } from "@Store/settings";

// Component
import { AttributeTracker } from "./AttributeTracker";
import { BonusTracker } from "./BonusTracker";
import { CalcListTracker } from "./CalcListTracker";
import { DebuffTracker } from "./DebuffTracker";
import { DefMultFormula } from "./DefMultFormula";

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
  const defIgnoreAll = attkBonusCtrl.get("defIgn_", ["all"]);
  const totalDefReduct = target.getReduction("def").value;

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
        <div>
          <DefMultFormula
            defIgnore={attkBonusCtrl.get("defIgn_", ["all", "NA"])}
            charLv={charLv}
            targetLv={target.level}
            totalDefReduct={totalDefReduct}
          />
          <CalcListTracker
            className="mt-1 space-y-1"
            data={result.NAs}
            attkBonusCtrl={attkBonusCtrl}
          />
        </div>
      ),
    },
    {
      heading: "Elemental Skill",
      body: (
        <div>
          <DefMultFormula
            defIgnore={attkBonusCtrl.get("defIgn_", ["all", "ES"])}
            charLv={charLv}
            targetLv={target.level}
            totalDefReduct={totalDefReduct}
          />
          <CalcListTracker
            className="mt-1 space-y-1"
            data={result.ES}
            attkBonusCtrl={attkBonusCtrl}
          />
        </div>
      ),
    },
    {
      heading: "Elemental Burst",
      body: (
        <div>
          <DefMultFormula
            defIgnore={attkBonusCtrl.get("defIgn_", ["all", "EB"])}
            charLv={charLv}
            targetLv={target.level}
            totalDefReduct={totalDefReduct}
          />
          <CalcListTracker
            className="mt-1 space-y-1"
            data={result.EB}
            attkBonusCtrl={attkBonusCtrl}
          />
        </div>
      ),
    },
  ];

  if (Object.keys(result.XTRA).length) {
    collapseItems.push({
      heading: "Extra",
      body: (
        <div>
          <DefMultFormula
            defIgnore={defIgnoreAll}
            charLv={charLv}
            targetLv={target.level}
            totalDefReduct={totalDefReduct}
          />
          <CalcListTracker
            className="mt-1 space-y-1"
            data={result.XTRA}
            attkBonusCtrl={attkBonusCtrl}
          />
        </div>
      ),
    });
  }

  collapseItems.push({
    heading: "Reactions",
    body: <CalcListTracker className="space-y-1" data={result.RXN} attkBonusCtrl={attkBonusCtrl} />,
  });

  if (Object.keys(result.WP).length) {
    collapseItems.push({
      heading: "Weapon",
      body: (
        <div>
          <DefMultFormula
            defIgnore={defIgnoreAll}
            charLv={charLv}
            targetLv={target.level}
            totalDefReduct={totalDefReduct}
          />
          <CalcListTracker
            className="mt-1 space-y-1"
            data={result.WP}
            attkBonusCtrl={attkBonusCtrl}
          />
        </div>
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
