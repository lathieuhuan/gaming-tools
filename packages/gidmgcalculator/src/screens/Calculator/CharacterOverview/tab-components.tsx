import { CarouselSpace } from "rond";

import { useTabs } from "@/hooks";
import { useCalcStore } from "@Store/calculator";
import { updateMain, updateMainWeapon } from "@Store/calculator/actions";
import { selectActiveMain, selectSetup } from "@Store/calculator/selectors";

import {
  AttributeTable,
  ConstellationList,
  SetBonusesView,
  TalentList,
  WeaponView,
} from "@/components";

export function AttributesTab() {
  const totalAttrs = useCalcStore((state) => selectActiveMain(state).totalAttrs);

  return (
    <div className="h-full custom-scrollbar">
      <AttributeTable attributes={totalAttrs} />
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

  const { activeIndex, tabProps, Tabs } = useTabs();

  return (
    <div className="h-full flex flex-col">
      <Tabs {...tabProps} level={2} configs={["Details", "Set Bonus"]} />

      <CarouselSpace className="mt-3 grow" current={activeIndex}>
        <div className="h-full custom-scrollbar">
          <AttributeTableTab />
        </div>
        <div className="h-full hide-scrollbar">
          <SetBonusesView sets={atfGear.sets} noTitle />
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
