import { CarouselSpace } from "rond";

import { useTabs } from "@/hooks";
import { useCalcStore } from "@Store/calculator";
import { updateCharacter, updateWeapon } from "@Store/calculator/actions";
import { selectActiveCharacter, selectSetup } from "@Store/calculator/selectors";

import {
  AttributeTable,
  ConstellationList,
  SetBonusesView,
  TalentList,
  WeaponView,
} from "@/components";

export function AttributesTab() {
  const totalAttrs = useCalcStore((state) => selectActiveCharacter(state).totalAttrs);

  return (
    <div className="h-full custom-scrollbar">
      <AttributeTable attributes={totalAttrs} />
    </div>
  );
}

export function WeaponTab() {
  const weapon = useCalcStore((state) => selectActiveCharacter(state).weapon);

  return (
    <div className="h-full hide-scrollbar">
      <WeaponView
        mutable
        weapon={weapon}
        upgrade={(level) => updateWeapon({ level })}
        refine={(refi) => updateWeapon({ refi })}
      />
    </div>
  );
}

function AttributeTableTab() {
  const artifactAttrs = useCalcStore((state) => selectSetup(state).artifactAttrs);
  return <AttributeTable attributes={artifactAttrs} />;
}

export function ArtifactsTab() {
  const artifact = useCalcStore((state) => selectActiveCharacter(state).artifact);

  const { activeIndex, tabProps, Tabs } = useTabs();

  return (
    <div className="h-full flex flex-col">
      <Tabs {...tabProps} level={2} configs={["Details", "Set Bonus"]} />

      <CarouselSpace className="mt-3 grow" current={activeIndex}>
        <div className="h-full custom-scrollbar">
          <AttributeTableTab />
        </div>
        <div className="h-full hide-scrollbar">
          <SetBonusesView sets={artifact.sets} noTitle />
        </div>
      </CarouselSpace>
    </div>
  );
}

export function ConstellationTab() {
  const character = useCalcStore(selectActiveCharacter);

  return (
    <ConstellationList
      character={character}
      onClickIcon={(i) => updateCharacter({ cons: character.cons === i + 1 ? i : i + 1 })}
    />
  );
}

export function TalentsTab() {
  const character = useCalcStore(selectActiveCharacter);

  return (
    <TalentList
      key={character.data.name}
      character={character}
      onChangeTalentLevel={(type, level) => updateCharacter({ [type]: level })}
    />
  );
}
