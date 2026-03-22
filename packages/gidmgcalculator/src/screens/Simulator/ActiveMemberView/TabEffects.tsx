import { selectActiveMember, useSimulatorStore } from "../store";

export function TabEffects() {
  const attkBonusCtrl = useSimulatorStore((state) => selectActiveMember(state).attkBonusCtrl);

  const records = Object.values(attkBonusCtrl.records).flat();

  return (
    <div>
      {records.map((record, index) => {
        return (
          <div key={index}>
            <div>{record.label}</div>
            <div>{record.toKey}</div>
            <div>{record.toType}</div>
            <div>{record.value}</div>
          </div>
        );
      })}
    </div>
  );
}
