import { BiLogInCircle } from "react-icons/bi";
import { Button } from "rond";
import type { HitEvent } from "@Src/types";

import { useTranslation } from "@Src/hooks";
import { useDispatch } from "@Store/hooks";
import { addEvent, changeOnFieldMember } from "@Store/simulator-slice";
import { useActiveMember, useActiveSimulation, ActiveMember, SimulationManager } from "@Simulator/ToolboxProvider";
import { getTalentHitEventConfig, type TalentHitEventConfig } from "./HitEventHost.utils";

// Components
import { OnFieldMemberWatch } from "../components";
import { HitEventCoordinator, HitEventDisplayer } from "./HitEventCoordinator";
import { TalentHitEvent } from "./TalentHitEvent";

interface HitEventHostProps {
  simulation: SimulationManager;
  member: ActiveMember;
  configs: TalentHitEventConfig[];
}
function HitEventHostCore({ simulation, member, configs }: HitEventHostProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onPerformTalentHitEvent = (eventInfo: Omit<HitEvent, "id" | "type" | "performer">, alsoSwitch?: boolean) => {
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
      <div className="h-full hide-scrollbar">
        <div className="flex justify-end">
          <Button
            className="switch-action-btn"
            size="small"
            boneOnly
            icon={<BiLogInCircle className="text-xl" />}
            iconPosition="end"
            onClick={() => {
              dispatch(changeOnFieldMember(member.data.code));
            }}
          >
            <span className="font-medium">Take the field</span>
          </Button>
        </div>

        <div className="mt-1 space-y-3">
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
                              return member.tools.configTalentHitEvent({
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
  );
}

export function HitEventHost(props: { className?: string }) {
  const simulation = useActiveSimulation();
  const activeMember = useActiveMember();

  if (!simulation || !activeMember) {
    return null;
  }

  return (
    <OnFieldMemberWatch className={props.className} activeMemberCode={activeMember.data.code}>
      <HitEventHostCore
        simulation={simulation}
        member={activeMember}
        configs={getTalentHitEventConfig(activeMember.data)}
      />
    </OnFieldMemberWatch>
  );
}
