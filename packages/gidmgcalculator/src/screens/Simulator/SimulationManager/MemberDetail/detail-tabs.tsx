import { useEffect, useState } from "react";
import { AppWeapon, GeneralCalc, TotalAttribute } from "@Backend";

import type { Character, SimulationMember } from "@Src/types";
import type { SimulationManager } from "@Simulator/ToolboxProvider";
import {
  ArtifactCard,
  AttributeTable,
  EquipmentDisplay,
  SetBonusesView,
  TalentList,
  WeaponCard,
} from "@Src/components";

export function AttributesTab({ simulation }: { simulation: SimulationManager }) {
  const [totalAttr, setTotalAttr] = useState<TotalAttribute | null>(null);

  useEffect(() => {
    if (simulation) {
      const { initialTotalAttr, unsubscribe } = simulation.subscribeTotalAttr(setTotalAttr);

      setTotalAttr(initialTotalAttr);
      return unsubscribe;
    }
    return undefined;
  }, [simulation]);

  return totalAttr ? <AttributeTable attributes={totalAttr} /> : null;
}

interface GreasTabProps {
  weapon: SimulationMember["weapon"];
  appWeapon: AppWeapon;
  artifacts: SimulationMember["artifacts"];
}
export function GrearsTab({ weapon, appWeapon, artifacts }: GreasTabProps) {
  const [detailIndex, setDetailIndex] = useState(-1);

  const onClickItem = (index: number) => {
    setDetailIndex(index === detailIndex ? -1 : index);
  };

  return (
    <div>
      <EquipmentDisplay
        className="mb-3"
        compact
        selectedIndex={detailIndex}
        weapon={weapon}
        appWeapon={appWeapon}
        artifacts={artifacts}
        onClickItem={onClickItem}
      />

      {detailIndex === 5 ? (
        <WeaponCard weapon={weapon} mutable={false} withGutter={false} />
      ) : detailIndex >= 0 ? (
        <ArtifactCard artifact={artifacts[detailIndex] ?? undefined} mutable={false} withGutter={false} />
      ) : (
        <SetBonusesView noTitle setBonuses={GeneralCalc.getArtifactSetBonuses(artifacts)} />
      )}
    </div>
  );
}

export function TalentsTab({ char }: { char: Character }) {
  return <TalentList char={char} />;
}
