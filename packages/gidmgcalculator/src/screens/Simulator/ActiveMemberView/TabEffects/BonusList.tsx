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
          case "TLLV":
            return (
              <div key={index} className="flex gap-2">
                <span>{t(bonus.toType)}</span>
                <span className="text-bonus">+{round(bonus.value, 1)}</span>
              </div>
            );
          case "ATTR":
            return (
              <div key={index} className="flex gap-2">
                <span>{t(bonus.toStat)}</span>
                <span className="text-bonus">
                  +{round(bonus.value, 1)}
                  {suffixOf(bonus.toStat)}
                </span>
              </div>
            );
          case "ATTK":
            return (
              <div key={index} className="flex gap-2">
                <span>
                  {t(bonus.toType)} {">"} {t(bonus.toKey)}
                </span>
                <span className="text-bonus">
                  +{round(bonus.value, 2)}
                  {suffixOf(bonus.toKey)}
                </span>
              </div>
            );
          default: {
            bonus satisfies never;
            return null;
          }
        }
      })}
    </div>
  );
}
