import { round } from "rond";
import { ATTACK_ELEMENTS, type AttackBonuses, type AttackBonusKey } from "@Calculation";

import { useTranslation } from "@/hooks";
import { suffixOf } from "@/utils";
import { getTotalRecordValue, recordListStyles, renderHeading, renderRecord } from "./_utils";

type BonusesTrackerProps = {
  attkBonuses: AttackBonuses;
};

export function BonusesTracker({ attkBonuses }: BonusesTrackerProps) {
  const { t } = useTranslation();

  const bonuses = attkBonuses.filter((bonus) => !bonus.type.startsWith("id."));

  return bonuses.length ? (
    <div className={`pl-2 mt-1 ${recordListStyles}`}>
      {bonuses.map((bonus) => {
        const list: Array<{
          key: AttackBonusKey;
          records: typeof bonus.records;
        }> = [];

        for (const record of bonus.records) {
          const existed = list.find((item) => item.key === record.toKey);

          if (existed) {
            existed.records.push(record);
          } else {
            list.push({
              key: record.toKey,
              records: [record],
            });
          }
        }

        const titleFrags = bonus.type.split(".").map((type) => {
          if (type === "all") {
            return "all";
          }
          if (ATTACK_ELEMENTS.includes(type as (typeof ATTACK_ELEMENTS)[number])) {
            return type === "phys" ? "physical" : type;
          }
          return t(type);
        });

        return (
          <div key={bonus.type} className="py-0.5 break-inside-avoid">
            <div className="text-secondary-1 capitalize">{titleFrags.join(" + ")}</div>

            <div>
              {list.map((item) => {
                const suffix = suffixOf(item.key);
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
    <p className="h-16 flex-center text-light-hint">No bonuses</p>
  );
}
