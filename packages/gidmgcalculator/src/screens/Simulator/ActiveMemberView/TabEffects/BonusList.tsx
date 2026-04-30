import { round } from "ron-utils";

import { useTranslation } from "@/hooks";
import { Bonus } from "../../models/Member";
import { suffixOf } from "@/utils/pure.utils";

type BonusListProps = {
  bonuses: Bonus[];
};

export function BonusList({ bonuses }: BonusListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-1 text-sm">
      {bonuses.map((bonus, index) => {
        switch (bonus.type) {
          case "ATTR": {
            return (
              <div key={index} className="flex gap-2">
                <div>{t(bonus.toStat)}</div>
                <div className="text-bonus">
                  {round(bonus.value, 1)}
                  {suffixOf(bonus.toStat)}
                </div>
              </div>
            );
          }
          case "ATTK": {
            return (
              <div key={index} className="flex gap-2">
                <div>
                  {t(bonus.toType)} {">"} {t(bonus.toKey)}
                </div>
                <div className="text-bonus">
                  {round(bonus.value, 2)}
                  {suffixOf(bonus.toKey)}
                </div>
              </div>
            );
          }
          default: {
            bonus satisfies never;
            return null;
          }
        }
      })}
    </div>
  );
}
