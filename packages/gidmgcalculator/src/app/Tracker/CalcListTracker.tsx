import type { CalcResultItem } from "@/logic/calculator";
import type { Character } from "@/models/Character";

import { AttackItemTracker } from "./AttackItemTracker";
import { RecordExclusives } from "./components/ResultRecord";
import { OtherItemTracker } from "./OtherItemTracker";
import { ReactionItemTracker } from "./ReactionItemTracker";

type CalcListTrackerProps = {
  className?: string;
  data: Map<string, CalcResultItem>;
  main: Character;
};

export function CalcListTracker({ className, data, main }: CalcListTrackerProps) {
  const { attkBonusCtrl } = main;

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
                  <RecordExclusives bonusGroups={attkBonusCtrl.exclusiveGroups(item.bonusId)} />
                }
              />
            );
          case "reaction":
            return (
              <ReactionItemTracker
                key={key}
                title={key}
                item={item}
                exclusiveRecord={
                  <RecordExclusives bonusGroups={attkBonusCtrl.exclusiveGroups(item.bonusId)} />
                }
                baseDMG={Math.round(main.baseReactionDMG)}
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
                  <RecordExclusives bonusGroups={attkBonusCtrl.exclusiveGroups(item.bonusId)} />
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
