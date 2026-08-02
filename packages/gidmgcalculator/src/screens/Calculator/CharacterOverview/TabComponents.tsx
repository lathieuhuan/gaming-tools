import { useState } from "react";
import { CarouselSpace, Tabs } from "rond";

import { useCalcStore, useShallowCalcStore } from "@Store/calculator";
import { updateMain, updateMainWeapon } from "@Store/calculator/actions";
import { selectActiveMain, selectSetup } from "@Store/calculator/selectors";

import { ConstellationList, TalentList } from "@/components/AbilityLists";
import { AttributeTable } from "@/components/AttributeTable";
import { SetBonusesView } from "@/components/SetBonusesView";
import { WeaponView } from "@/components/WeaponCard";

export function AttributesTab() {
  const { allAttrs, attkBonusCtrl } = useShallowCalcStore((state) => {
    const { allAttrsCtrl, attkBonusCtrl } = selectActiveMain(state);
    return {
      allAttrs: allAttrsCtrl.finals,
      attkBonusCtrl,
    };
  });

  return (
    <div className="h-full custom-scrollbar">
      <AttributeTable attributes={allAttrs} attkBonusCtrl={attkBonusCtrl} />
    </div>
  );
}

export function WeaponTab() {
  const weapon = useCalcStore((state) => selectActiveMain(state).weapon);

  return (
    <div className="h-full hide-scrollbar">
      <WeaponView
        mutable
        weapon={weapon}
        upgrade={(level) => updateMainWeapon({ level })}
        refine={(refi) => updateMainWeapon({ refi })}
      />
    </div>
  );
}

function AttributeTableTab() {
  const artifactAttrs = useCalcStore((state) => selectSetup(state).main.atfGear.finalAttrs);
  return <AttributeTable attributes={artifactAttrs} />;
}

export function ArtifactsTab() {
  const atfGear = useCalcStore((state) => selectActiveMain(state).atfGear);
  const [tab, setTab] = useState(0);

  return (
    <div className="h-full flex flex-col">
      <Tabs
        size="md"
        variant="primary"
        items={[
          { value: 0, label: "Details" },
          { value: 1, label: "Set Bonus" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <CarouselSpace className="mt-3 grow" current={tab}>
        <div className="h-full custom-scrollbar">
          <AttributeTableTab />
        </div>
        <div className="h-full hide-scrollbar">
          <SetBonusesView hideTitle sets={atfGear.sets} />
        </div>
      </CarouselSpace>
    </div>
  );
}

export function ConstellationTab() {
  const main = useCalcStore(selectActiveMain);

  return (
    <ConstellationList
      character={main}
      onClickIcon={(i) => updateMain({ cons: main.cons === i + 1 ? i : i + 1 })}
    />
  );
}

export function TalentsTab() {
  const main = useCalcStore(selectActiveMain);

  return (
    <TalentList
      key={main.data.name}
      character={main}
      onChangeTalentLevel={(type, level) => updateMain({ [type]: level })}
    />
  );
}
