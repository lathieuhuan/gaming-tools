import type {
  CalcResultAttackItem,
  CalcResultOtherItem,
  CalcResultReactionItem,
} from "@/calculation/types";
import type { AttackBonusControl } from "@/models/Character";

import { AttackItemTracker } from "./AttackItemTracker";
import { OtherItemTracker } from "./OtherItemTracker";
import { ReactionItemTracker } from "./ReactionItemTracker";

type CalcListTrackerProps = {
  className?: string;
  data: Record<string, CalcResultAttackItem | CalcResultOtherItem | CalcResultReactionItem>;
  attkBonusCtrl: AttackBonusControl;
};

export function CalcListTracker({ className, data, attkBonusCtrl }: CalcListTrackerProps) {
  return (
    <div className={className}>
      {Object.entries(data).map(([key, item]) => {
        switch (item.type) {
          case "attack":
            return (
              <AttackItemTracker key={key} title={key} item={item} attkBonusCtrl={attkBonusCtrl} />
            );
          case "reaction":
            return <ReactionItemTracker key={key} title={key} item={item} />;
          case "other":
          case "healing":
          case "shield":
            return (
              <OtherItemTracker key={key} title={key} item={item} attkBonusCtrl={attkBonusCtrl} />
            );
          default:
            item satisfies never;
        }
      })}
    </div>
  );
}
