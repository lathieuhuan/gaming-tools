import type { CalcResultItem } from "@/logic/calculator";
import type { AttackBonusControl } from "@/models/Character";

import { AttackItemTracker } from "./AttackItemTracker";
import { OtherItemTracker } from "./OtherItemTracker";
import { RecordExclusives } from "./components/ResultRecord";

type CalcListTrackerProps = {
  className?: string;
  data: Map<string, CalcResultItem>;
  attkBonusCtrl: AttackBonusControl;
};

export function CalcListTracker({ className, data, attkBonusCtrl }: CalcListTrackerProps) {
  return (
    <div className={className}>
      {Array.from(data, ([key, item]) => {
        switch (item.type) {
          case "attack":
            return (
              <AttackItemTracker
                key={key}
                title={key}
                item={item}
                exclusiveRecord={
                  item.bonusId !== undefined && (
                    <RecordExclusives id={item.bonusId} attkBonusCtrl={attkBonusCtrl} />
                  )
                }
              />
            );
          case "other":
          case "healing":
          case "shield":
            return (
              <OtherItemTracker
                key={key}
                title={key}
                item={item}
                exclusiveRecord={
                  item.bonusId !== undefined && (
                    <RecordExclusives id={item.bonusId} attkBonusCtrl={attkBonusCtrl} />
                  )
                }
              />
            );
          default:
            item satisfies never;
        }
      })}
    </div>
  );
}
