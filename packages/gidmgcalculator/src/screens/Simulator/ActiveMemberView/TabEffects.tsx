import { selectActiveMember, useSimulatorStore } from "../store";

export function TabEffects() {
  const attkBonusCtrl = useSimulatorStore((state) => selectActiveMember(state).attkBonusCtrl);

  const groups = Array.from(attkBonusCtrl.records.entries());

  return (
    <div>
      {groups.map((group) => {
        const [groupId, bonuses] = group;

        return (
          <div key={groupId}>
            {bonuses.map((bonus, index) => {
              return (
                <div key={index} className="flex gap-2">
                  <div>{bonus.toType}</div>
                  <div>{bonus.toKey}</div>
                  <div>{bonus.value}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
