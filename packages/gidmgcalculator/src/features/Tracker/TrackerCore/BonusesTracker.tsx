import { round } from "rond";
import { ATTACK_ELEMENTS, type AttackBonuses, type AttackBonusKey } from "@Backend";

import { useTranslation } from "@Src/hooks";
import { Utils_ } from "@Src/utils";
import { getTotalRecordValue, recordListStyles, renderHeading, renderRecord } from "./TrackerCore.utils";

interface BonusesTrackerProps {
  attBonus: AttackBonuses;
}
export function BonusesTracker({ attBonus }: BonusesTrackerProps) {
  const { t } = useTranslation();

  const bonuses = attBonus.filter((bonus) => bonus.type.slice(0, 2) !== "id");

  return bonuses.length ? (
    <div className={`pl-2 mt-1 ${recordListStyles}`}>
      {bonuses.map((bonus) => {
        const list: Array<{
          key: AttackBonusKey;
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
