import { selectActiveMember, useSimulatorStore } from "../store";

export function TabEffects() {
  const attkBonusCtrl = useSimulatorStore((state) => selectActiveMember(state).attkBonusCtrl);

  const groups = Array.from(attkBonusCtrl.records.entries());

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const [groupId, { meta, bonuses }] = group;

        return (
          <div key={groupId} className="p-2 rounded-md bg-dark-2">
            <div className="font-semibold">{meta.src}</div>
            <div className="space-y-1 text-sm">
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
          </div>
        );
      })}
    </div>
  );
}
