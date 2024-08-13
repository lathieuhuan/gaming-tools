import { BiLogInCircle } from "react-icons/bi";
import { Button, clsx, type ClassValue } from "rond";
import type { HitEvent } from "@Src/types";

import { useActiveMember } from "@Simulator/ToolboxProvider";
import { useTranslation } from "@Src/hooks";
import { useDispatch } from "@Store/hooks";
import { addEvent, changeOnFieldMember } from "@Store/simulator-slice";
import { getTalentHitEventConfig } from "./HitEventHost.utils";

// Components
import { HitEventCoordinator, HitEventDisplayer } from "./HitEventCoordinator";
import { TalentHitEvent } from "./TalentHitEvent";

interface HitEventHostProps {
  className?: ClassValue;
}
export function HitEventHost({ className }: HitEventHostProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeMember = useActiveMember();

  if (!activeMember) {
    return null;
  }
  const configs = getTalentHitEventConfig(activeMember.data);

  const onPerformTalentHitEvent = (eventInfo: Omit<HitEvent, "id" | "type" | "performer">, alsoSwitch?: boolean) => {
    dispatch(
      addEvent({
        type: "HIT",
        performer: {
          type: "CHARACTER",
          code: activeMember.data.code,
        },
        ...eventInfo,
        alsoSwitch,
      })
    );
  };

  return (
    <div className={clsx("p-4", className)}>
      <HitEventCoordinator>
        <div className="h-full hide-scrollbar">
          <div className="space-y-3">
            {configs.map((config) => {
              if (config.groups.every((group) => !group.items.length)) {
                return null;
              }

              return (
                <div key={config.type}>
                  <p className="text-sm text-light-default/60">{t(config.type)}</p>

                  <div className="mt-1 space-y-2">
                    {config.groups.map((group) => {
                      // #to-do
                      const disabled = false;

                      return group.items.map((item) => {
                        // #to-do: should make unique id (?)
                        const id = `${group.type}.${item.name}`;

                        const eventInfo = {
                          calcItemId: item.name,
                          talent: config.type,
                          duration: 0,
                        };

                        return (
                          <HitEventDisplayer
                            key={id}
                            id={id}
                            label={item.name}
                            disabled={disabled}
                            onQuickHit={() => onPerformTalentHitEvent(eventInfo)}
                          >
                            <TalentHitEvent
                              item={item}
                              getTalentEventConfig={(attkBonus, elmtModCtrls) => {
                                return activeMember.tools.configTalentHitEvent({
                                  talent: config.type,
                                  pattern: group.type,
                                  item,
                                  attkBonus,
                                  elmtModCtrls,
                                });
                              }}
                              onPerformEvent={(elmtModCtrls, alsoSwitch) =>
                                onPerformTalentHitEvent(
                                  {
                                    ...eventInfo,
                                    elmtModCtrls,
                                  },
                                  alsoSwitch
                                )
                              }
                            />
                          </HitEventDisplayer>
                        );
                      });
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </HitEventCoordinator>
    </div>
  );
}
