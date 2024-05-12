import { round } from "rond";
import { AttackBonus, BonusKey } from "@Backend";

import { useTranslation } from "@Src/hooks";
import { getTotalRecordValue, recordListStyles, renderHeading, renderRecord } from "./TrackerCore.utils";
import { Utils_ } from "@Src/utils";

interface BonusesTrackerProps {
  attBonus: AttackBonus;
}
export function BonusesTracker({ attBonus }: BonusesTrackerProps) {
  const { t } = useTranslation();

  const bonuses = attBonus.filter((bonus) => bonus.type.slice(0, 2) !== "id");

  return bonuses.length ? (
    <div className={`pl-2 mt-1 ${recordListStyles}`}>
      {bonuses.map((bonus) => {
        const list: Array<{
          key: BonusKey;
          records: typeof bonus.records;
        }> = [];

        for (const record of bonus.records) {
          const existed = list.find((item) => item.key === record.to);

          if (existed) {
            existed.records.push(record);
          } else {
            list.push({
              key: record.to,
              records: [record],
            });
          }
        }

        return (
          <div key={bonus.type} className="py-0.5 break-inside-avoid">
            <p className="text-secondary-1">{bonus.type === "all" ? "All" : t(bonus.type)}</p>

            <div>
              {list.map((item) => {
                const suffix = Utils_.suffixOf(item.key);
                const decimalDigits = suffix ? 2 : 0;

                return (
                  <div key={item.key} className="pl-2">
                    {renderHeading(t(item.key), round(getTotalRecordValue(item.records), decimalDigits) + suffix)}

                    <ul className="pl-4 list-disc">
                      {item.records.map(renderRecord((value) => round(value, decimalDigits) + suffix))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="h-16 flex-center text-hint-color">No bonuses</p>
  );
}
