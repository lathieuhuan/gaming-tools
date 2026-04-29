import { round } from "ron-utils";

import { useTranslation } from "@/hooks";
import { selectActiveMember, useSimulatorStore } from "../store";

export function TabEffects() {
  const { t } = useTranslation();
  const bonusCtrl = useSimulatorStore((state) => selectActiveMember(state).bonusCtrl);

  const bonusGroups = Array.from(bonusCtrl.groups.values());

  return (
    <div className="space-y-2">
      {bonusGroups.map(({ meta, bonuses }) => {
        return (
          <div key={meta.id} className="p-2 rounded-md bg-dark-2">
            <div className="font-semibold">{meta.src}</div>
            <div className="space-y-1 text-sm">
              {bonuses.map((bonus, index) => {
                switch (bonus.type) {
                  case "ATTR": {
                    return (
                      <div key={index} className="flex gap-2">
                        <div>{t(bonus.toStat)}</div>
                        <div>{round(bonus.value, 1)}</div>
                      </div>
                    );
                  }
                  case "ATTK": {
                    return (
                      <div key={index} className="flex gap-2">
                        <div>{t(bonus.toType)}</div>
                        <div>{t(bonus.toKey)}</div>
                        <div>{round(bonus.value, 2)}</div>
                      </div>
                    );
                  }
                  default: {
                    bonus satisfies never;
                  }
                }
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
