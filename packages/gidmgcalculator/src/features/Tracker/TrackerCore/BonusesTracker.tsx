import { round } from "rond";
import { AttackBonus, REACTIONS, TrackerResult } from "@Backend";

import { useTranslation } from "@Src/hooks";
import { getTotalRecordValue, recordListStyles, renderHeading, renderRecord } from "./TrackerCore.utils";

interface BonusesTrackerProps {
  result?: TrackerResult;
  attBonus: AttackBonus;
}
export function BonusesTracker({ result, attBonus }: BonusesTrackerProps) {
  const { t } = useTranslation();

  const { ATTR, RXN } = result || {};
  const em = getTotalRecordValue(ATTR?.em || []);
  const hasRxnBonus = RXN && Object.values(RXN).some((records) => records.length);

  console.log(attBonus);

  return (
    <div className="pl-2 -mt-1 -mb-3 divide-y divide-surface-border">
      {hasRxnBonus || em ? (
        <div className={"py-3 " + recordListStyles}>
          {REACTIONS.map((reaction) => {
            const records = RXN?.[`${reaction}.pct_`] || [];

            return records.length || em ? (
              <div key={reaction} className="break-inside-avoid">
                {renderHeading(t(reaction), round(getTotalRecordValue(records), 1) + "%")}

                <ul className="pl-4 list-disc">{records.map(renderRecord((value) => round(value, 1) + "%"))}</ul>
              </div>
            ) : null;
          })}
        </div>
      ) : null}
    </div>
  );
}
