import { useEffect, useState } from "react";
import { CollapseList, CollapseListProps } from "rond";
import { AttackPattern, GeneralCalc, TrackerControl, TrackerResult, calculateSetup } from "@Backend";

import type { Infusion } from "@Src/types";
import type { TrackerState } from "@Store/ui-slice";

import { useSelector } from "@Store/hooks";
import { selectCalcFinalResult, selectTarget } from "@Store/calculator-slice";
import { getTotalRecordValue } from "./TrackerCore.utils";

// Component
import { Green, Dim } from "@Src/components";
import { AttributesTracker } from "./AttributesTracker";
import { BonusesTracker } from "./BonusesTracker";
import { DebuffsTracker } from "./DebuffsTracker";
import { CalcItemTracker } from "./CalcItemTracker";

interface TrackerCoreProps {
  trackerState: TrackerState;
}
export function TrackerCore({ trackerState }: TrackerCoreProps) {
  const activeSetup = useSelector((state) => {
    const { activeId, setupsById } = state.calculator;
    return setupsById[activeId];
  });
  const target = useSelector(selectTarget);
  const finalResult = useSelector(selectCalcFinalResult);

  const [result, setResult] = useState<TrackerResult>();
  const [infusion, setInfusion] = useState<Infusion>({
    element: "phys",
  });
  const [xtraInfo, setXtraInfo] = useState<{ inHealB_?: number }>({});

  const { totalAttr, attPattBonus, attElmtBonus, rxnBonus } = result || {};
  const charLv = GeneralCalc.getBareLv(activeSetup.char.level);
  const totalDefReduct = getTotalRecordValue(result?.resistReduct.def || []);

  useEffect(() => {
    if (trackerState === "open") {
      const tracker = new TrackerControl();
      const finalResult = calculateSetup(activeSetup, target, tracker);

      setResult(tracker.finalize());
      setInfusion({
        element: finalResult.infusedElement,
        range: finalResult.infusedAttacks,
      });
      setXtraInfo({ inHealB_: finalResult.totalAttr.inHealB_ });
    }
  }, [trackerState]);

  const renderDefMultiplier = (talent: AttackPattern | "WP_CALC") => {
    const talentDefIgnore = talent === "WP_CALC" ? 0 : getTotalRecordValue(attPattBonus?.[`${talent}.defIgn_`] || []);
    const allDefIgnore = getTotalRecordValue(attPattBonus?.["all.defIgn_"] || []);
    const totalDefIgnore = talentDefIgnore + allDefIgnore;

    return (
      <div className="flex items-center">
        <p className="mr-4 text-primary-1">DEF Mult.</p>

        <div className="flex flex-col items-center">
          <p>
            <Dim>char. Lv.</Dim> <Green>{charLv}</Green> + 100
          </p>

          <div className="my-1 w-full h-px bg-rarity-1" />

          <p className="px-2 text-center">
            {totalDefReduct ? (
              <>
                (1 - <Dim>DEF reduction</Dim> <Green>{totalDefReduct}</Green> / 100) *
              </>
            ) : null}{" "}
            {totalDefIgnore ? (
              <>
                (1 - <Dim>DEF ignore</Dim> <Green>{totalDefIgnore}</Green> / 100) *
              </>
            ) : null}{" "}
            (<Dim>target Lv.</Dim> <Green>{target.level}</Green> + 100) + <Dim>char. Lv.</Dim> <Green>{charLv}</Green> +
            100
          </p>
        </div>
      </div>
    );
  };

  const collapseItems: CollapseListProps["items"] = [
    {
      heading: "Attributes",
      body: <AttributesTracker totalAttr={totalAttr} />,
    },
    {
      heading: "Bonuses",
      body: (
        <BonusesTracker {...{ attPattBonus, attElmtBonus, rxnBonus }} em={getTotalRecordValue(totalAttr?.em || [])} />
      ),
    },
    {
      heading: "Debuffs on Target",
      body: <DebuffsTracker resistReduct={result?.resistReduct} />,
    },
    {
      heading: "Normal Attacks",
      body: (
        <CalcItemTracker
          records={result?.NAs}
          result={finalResult.NAs}
          defMultDisplay={renderDefMultiplier("NA")}
          infusion={infusion}
          {...xtraInfo}
        />
      ),
    },
    {
      heading: "Elemental Skill",
      body: (
        <CalcItemTracker
          records={result?.ES}
          result={finalResult.ES}
          defMultDisplay={renderDefMultiplier("ES")}
          {...xtraInfo}
        />
      ),
    },
    {
      heading: "Elemental Burst",
      body: (
        <CalcItemTracker
          records={result?.EB}
          result={finalResult.EB}
          defMultDisplay={renderDefMultiplier("EB")}
          {...xtraInfo}
        />
      ),
    },
    {
      heading: "Reactions",
      body: <CalcItemTracker records={result?.RXN} result={finalResult.RXN} />,
    },
  ];

  if (result?.WP_CALC) {
    collapseItems.push({
      heading: "Weapon",
      body: (
        <CalcItemTracker
          records={result.WP_CALC}
          result={finalResult.WP_CALC}
          coreMultLabel="DMG Mult."
          defMultDisplay={renderDefMultiplier("EB")}
          {...xtraInfo}
        />
      ),
    });
  }

  return (
    <div className="h-full custom-scrollbar cursor-default" onDoubleClick={() => console.log(result)}>
      <CollapseList items={collapseItems} />
    </div>
  );
}
