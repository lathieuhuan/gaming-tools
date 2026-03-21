import { useState } from "react";
import { Button, clsx, CollapseSpace } from "rond";

import type { AppCharacter, LevelableTalentType, TalentCalcItem } from "@/types";

import { triggerTalentHitEvent } from "../actions/build";

type HitEventMenuProps = {
  className?: string;
  data: AppCharacter;
};

export function HitEventMenu({ className, data }: HitEventMenuProps) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const handleTrigger = (talent: LevelableTalentType, index: number, item: TalentCalcItem) => {
    triggerTalentHitEvent({
      performer: data.code,
      talent,
      index,
    });
  };

  return (
    <div className={clsx("space-y-2", className)}>
      {data.calcList.NA.map((item, index) => {
        const active = index === activeIndex;
        const { type = "attack" } = item;

        return (
          <div key={item.name}>
            <div
              className="px-2 py-1 font-semibold bg-dark-2 rounded-sm cursor-pointer"
              onClick={() => setActiveIndex(active ? -1 : index)}
            >
              {item.name}
            </div>

            <CollapseSpace active={active}>
              <div className="py-1">
                <div>{type}</div>
                <div className="flex justify-end">
                  <Button
                    size="small"
                    hidden={type !== "attack"}
                    variant="primary"
                    onClick={() => handleTrigger("NAs", index, item)}
                  >
                    Trigger
                  </Button>
                </div>
              </div>
            </CollapseSpace>
          </div>
        );
      })}
    </div>
  );
}
