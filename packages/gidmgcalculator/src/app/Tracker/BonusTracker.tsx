import { Object_, round } from "ron-utils";
import { clsx } from "rond";

import type { AttackBonus, AttackBonusKey, AttackElement } from "@/types";

import { ATTACK_ELEMENTS } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { AttackBonusControl } from "@/models/Character";
import { suffixOf } from "@/utils/pure.utils";

import { Heading, List } from "./components/ResourceLayout";

type BonusTrackerProps = {
  listClassName?: string;
  attkBonusCtrl: AttackBonusControl;
};

export function BonusTracker({ listClassName, attkBonusCtrl }: BonusTrackerProps) {
  const { t } = useTranslation();

  const records = attkBonusCtrl.records;
  const types = Object_.keys(records);

  return (
    <div>
      <div className={clsx("pl-2 pt-1 peer", listClassName)}>
        {types.map((type) => {
          if (type.slice(0, 2) === "id") {
            return null;
          }

          const list: Array<{
            key: AttackBonusKey;
            records: AttackBonus[];
          }> = [];

          for (const record of records[type]) {
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

          const titleFrags = type.split(".").map((type) => {
            if (type === "all") {
              return "all";
            }
            if (ATTACK_ELEMENTS.includes(type as AttackElement)) {
              return type === "phys" ? "physical" : type;
            }
            return t(type);
          });

          return (
            <div key={type} className="py-0.5 break-inside-avoid">
              <div className="text-secondary-1 capitalize">{titleFrags.join(" + ")}</div>

              <div>
                {list.map((item) => {
                  const suffix = suffixOf(item.key);
                  const decimalDigits = suffix ? 2 : 0;
                  const totalValue = item.records.reduce(
                    (accumulator, record) => accumulator + record.value,
                    0,
                  );

                  return (
                    <div key={item.key} className="pl-2">
                      <Heading
                        label={t(item.key)}
                        value={round(totalValue, decimalDigits) + suffix}
                      />

                      <List
                        records={item.records}
                        calcFn={(value) => round(value, decimalDigits) + suffix}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-16 text-light-hint hidden peer-empty:flex-center">
        <p>No bonuses</p>
      </div>
    </div>
  );
}
