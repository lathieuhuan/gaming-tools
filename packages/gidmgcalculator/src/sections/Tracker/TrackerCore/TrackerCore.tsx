import { useEffect, useState } from "react";
import { CollapseList, CollapseListProps } from "rond";
import { AttackBonuses, AttackPattern, GeneralCalc, TrackerControl, TrackerResult, calculateSetup } from "@Backend";

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

type ExtraInfo = {
  inHealB_: number;
  attkBonuses: AttackBonuses;
};

function getTotalDefIgnore(talent: AttackPattern | "all", attkBonuses: AttackBonuses) {
  let result = 0;

  for (const bonus of attkBonuses ?? []) {
    if (bonus.type.includes(talent)) {
      for (const record of bonus.records) {
        if (record.toKey === "defIgn_") {
          result += record.value;
        }
      }
    }
  }
  return result;
}

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
  const [xtraInfo, setXtraInfo] = useState<ExtraInfo>({
    inHealB_: 0,
    attkBonuses: [],
  });

  const charLv = GeneralCalc.getBareLv(activeSetup.char.level);
  const totalDefReduct = getTotalRecordValue(result?.RESIST.def || []);

  useEffect(() => {
    if (trackerState === "open") {
      const tracker = new TrackerControl();
      const finalResult = calculateSetup(activeSetup, target, tracker);

      setResult(tracker.finalize());
      setXtraInfo({
        inHealB_: finalResult.totalAttr.inHealB_,
        attkBonuses: finalResult.attkBonuses,
      });
    }
  }, [trackerState]);

  const renderDefMultiplier = (talent: AttackPattern | "WP_CALC") => {
    const totalDefIgnore =
      getTotalDefIgnore("all", xtraInfo.attkBonuses) +
      (talent === "WP_CALC" ? 0 : getTotalDefIgnore(talent, xtraInfo.attkBonuses));

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
      body: <AttributesTracker result={result} />,
    },
    {
      heading: "Bonuses",
      body: <BonusesTracker attkBonuses={xtraInfo.attkBonuses} />,
    },
    {
      heading: "Debuffs on Target",
      body: <DebuffsTracker result={result} />,
    },
    {
      heading: "Normal Attacks",
      body: (
        <CalcItemTracker
          records={result?.NAs}
          resultGroup={finalResult.NAs}
          defMultDisplay={renderDefMultiplier("NA")}
          {...xtraInfo}
        />
      ),
    },
    {
      heading: "Elemental Skill",
      body: (
        <CalcItemTracker
          records={result?.ES}
          resultGroup={finalResult.ES}
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
          resultGroup={finalResult.EB}
          defMultDisplay={renderDefMultiplier("EB")}
          {...xtraInfo}
        />
      ),
    },
    {
      heading: "Reactions",
      body: <CalcItemTracker records={result?.RXN_CALC} resultGroup={finalResult.RXN_CALC} />,
    },
  ];

  if (result?.WP_CALC) {
    collapseItems.push({
      heading: "Weapon",
      body: (
        <CalcItemTracker
          records={result.WP_CALC}
          resultGroup={finalResult.WP_CALC}
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
