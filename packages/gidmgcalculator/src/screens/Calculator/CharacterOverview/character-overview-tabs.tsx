import { CarouselSpace } from "rond";
import { GeneralCalc, TotalAttributeControl } from "@Calculation";

import { useTabs } from "@Src/hooks";
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectArtifacts,
  selectCharacter,
  selectParty,
  selectTotalAttr,
  selectWeapon,
  updateCharacter,
  updateWeapon,
} from "@Store/calculator-slice";
import { AttributeTable, SetBonusesView, WeaponView, TalentList, ConstellationList } from "@Src/components";
import { useCharacterData } from "../ContextProvider";

export function AttributesTab() {
  const totalAttr = useSelector(selectTotalAttr);
  return (
    <div className="h-full custom-scrollbar">
      <AttributeTable attributes={totalAttr} />
    </div>
  );
}

export function WeaponTab() {
  const dispatch = useDispatch();
  const weapon = useSelector(selectWeapon);
  return (
    <div className="h-full hide-scrollbar">
      <WeaponView
        mutable
        weapon={weapon}
        upgrade={(level) => dispatch(updateWeapon({ level }))}
        refine={(refi) => dispatch(updateWeapon({ refi }))}
      />
    </div>
  );
}

export function ArtifactsTab() {
  const totalAttr = useSelector(selectTotalAttr);
  const artifacts = useSelector(selectArtifacts);
  const artifactAttributes = TotalAttributeControl.getArtifactAttributes(artifacts).finalize(totalAttr);

  const { activeIndex, tabProps, Tabs } = useTabs();

  return (
    <div className="h-full flex flex-col">
      <Tabs {...tabProps} level={2} configs={["Details", "Set Bonus"]} />

      <CarouselSpace className="mt-3 grow" current={activeIndex}>
        <div className="h-full custom-scrollbar">
          <AttributeTable attributes={artifactAttributes} />
        </div>
        <div className="h-full hide-scrollbar">
          <SetBonusesView setBonuses={GeneralCalc.getArtifactSetBonuses(artifacts)} noTitle />
        </div>
      </CarouselSpace>
    </div>
  );
}

export function ConstellationTab() {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);
  return (
    <ConstellationList
      character={character}
      onClickIcon={(i) => dispatch(updateCharacter({ cons: character.cons === i + 1 ? i : i + 1 }))}
    />
  );
}

export function TalentsTab() {
  const dispatch = useDispatch();
  const character = useSelector(selectCharacter);
  const party = useSelector(selectParty);
  const characterData = useCharacterData();

  return (
    <TalentList
      key={character.name}
      character={character}
      characterData={characterData}
      onChangeTalentLevel={(type, level) => {
        dispatch(updateCharacter({ [type]: level }));
      }}
      party={party}
    />
  );
}
