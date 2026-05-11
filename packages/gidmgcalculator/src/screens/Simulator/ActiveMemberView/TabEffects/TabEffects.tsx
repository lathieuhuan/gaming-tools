import { selectActiveMember, useSimulatorStore } from "../../store";
import { BonusList } from "./BonusList";

export function TabEffects() {
  const bonusCtrl = useSimulatorStore((state) => selectActiveMember(state).bonusCtrl);

  const innateBonusGroups = Array.from(bonusCtrl.innateGroups.values());
  const bonusGroups = Array.from(bonusCtrl.groups.values());

  const handleDoubleClick = () => {
    console.info(innateBonusGroups);
    console.info(bonusGroups);
  };

  return (
    <div className="space-y-2" onDoubleClick={handleDoubleClick}>
      {innateBonusGroups.map(({ meta, bonuses }) => {
        return (
          <div key={meta.id} className="p-2 rounded-sm bg-dark-2">
            <div className="mb-2 text-light-hint text-xs flex items-center">
              <span className="font-semibold">{meta.src}</span>
              <span className="ml-auto font-normal">{meta.innate ? "innate" : ""}</span>
            </div>
            <BonusList bonuses={bonuses} />
          </div>
        );
      })}
      {bonusGroups.map(({ meta, bonuses }) => {
        return (
          <div key={meta.id} className="p-2 rounded-sm bg-dark-2">
            <div className="mb-2 text-light-hint text-xs flex items-center">
              <span className="font-semibold">{meta.src}</span>
              <span className="ml-auto font-normal">{meta.innate ? "innate" : ""}</span>
            </div>
            <BonusList bonuses={bonuses} />
          </div>
        );
      })}
    </div>
  );
}
