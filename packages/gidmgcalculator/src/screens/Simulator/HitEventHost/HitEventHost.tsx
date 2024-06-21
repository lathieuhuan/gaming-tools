import type { HitEvent } from "@Src/types";

import {
  ActiveMember,
  ActiveSimulation,
  useActiveMember,
  useActiveSimulation,
  useOnFieldMember,
} from "@Simulator/ToolboxProvider";
import { useTranslation } from "@Src/hooks";
import { useDispatch } from "@Store/hooks";
import { addEvent } from "@Store/simulator-slice";
import { getTalentHitEventConfig, type TalentHitEventConfig } from "./HitEventHost.utils";

// Components
import { HitEventCoordinator, HitEventDisplayer } from "./HitEventCoordinator";
import { TalentHitEvent } from "./TalentHitEvent";

interface HitEventHostProps {
  simulation: ActiveSimulation;
  member: ActiveMember;
  configs: TalentHitEventConfig[];
}
function HitEventHostCore({ simulation, member, configs }: HitEventHostProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isOnField = useOnFieldMember(simulation) === member.data.code;

  const onPerformTalentHitEvent = (eventInfo: Omit<HitEvent, "id" | "type" | "performer">) => {
    const alsoSwitch = eventInfo.alsoSwitch && !isOnField ? true : undefined;

    dispatch(
      addEvent({
        type: "HIT",
        performer: {
          type: "CHARACTER",
          code: member.data.code,
        },
        ...eventInfo,
        alsoSwitch,
      })
    );
  };

  return (
    <HitEventCoordinator>
      <div className="h-full hide-scrollbar space-y-3">
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
                          isOnField={isOnField}
                          getTalentEventConfig={(attkBonus, elmtModCtrls) => {
                            return member.tools.configTalentHitEvent({
                              talent: config.type,
                              pattern: group.type,
                              item,
                              attkBonus,
                              elmtModCtrls,
                            });
                          }}
                          onPerformEvent={(elmtModCtrls, alsoSwitch) =>
                            onPerformTalentHitEvent({
                              ...eventInfo,
                              elmtModCtrls,
                              alsoSwitch,
                            })
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
        {/* <AttackEventGroup
            name={t("RXN_CALC")}
            items={[...TRANSFORMATIVE_REACTIONS]}
            getItemState={(item, itemIndex) => ({
              label: t(item),
              isActive: configGroups.length === active.groupI && itemIndex === active.itemI,
            })}
            renderContent={() => <p>Hello</p>}
            onPerformEvent={() => {}}
            onExpandEvent={(_, index, active) => onExpandTalentEvent(configGroups.length, index, active)}
          /> */}
      </div>
    </HitEventCoordinator>
  );
}

export function HitEventHost(props: { className?: string }) {
  const simulation = useActiveSimulation();
  const activeMember = useActiveMember();

  if (!simulation || !activeMember) {
    return null;
  }

  return (
    <div className={props.className}>
      <HitEventHostCore
        simulation={simulation}
        member={activeMember}
        configs={getTalentHitEventConfig(activeMember.data)}
      />
    </div>
  );
}
