import type { HitEvent } from "@Src/types";

import { ActiveMember, useActiveMember } from "@Simulator/ToolboxProvider";
import { useTranslation } from "@Src/hooks";
import { useDispatch } from "@Store/hooks";
import { addEvent } from "@Store/simulator-slice";
import { getTalentHitEventConfig, type TalentHitEventConfig } from "./HitEventHost.utils";

// Components
import { HitEventCoordinator, HitEventDisplayer } from "./HitEventCoordinator";
import { TalentHitEvent } from "./TalentHitEvent";

interface HitEventHostProps {
  member: ActiveMember;
  configs: TalentHitEventConfig[];
}

function HitEventHostCore({ member, configs }: HitEventHostProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onPerformTalentHitEvent = (eventInfo: Omit<HitEvent, "id" | "type" | "performer">) => {
    dispatch(
      addEvent({
        type: "HIT",
        performer: {
          type: "CHARACTER",
          code: member.data.code,
        },
        ...eventInfo,
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
                          getTalentEventConfig={(attkBonus, elmtModCtrls) => {
                            return member.tools.configTalentHitEvent({
                              talent: config.type,
                              pattern: group.type,
                              item,
                              attkBonus,
                              elmtModCtrls,
                            });
                          }}
                          onPerformEvent={(elmtModCtrls) =>
                            onPerformTalentHitEvent({
                              ...eventInfo,
                              elmtModCtrls,
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
  const activeMember = useActiveMember();

  if (!activeMember) {
    return null;
  }

  return (
    <div className={props.className}>
      <HitEventHostCore member={activeMember} configs={getTalentHitEventConfig(activeMember.data)} />
    </div>
  );
}
