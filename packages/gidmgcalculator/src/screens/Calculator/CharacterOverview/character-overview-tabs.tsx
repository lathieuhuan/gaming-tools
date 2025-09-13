import { GeneralCalc, TotalAttributeControl } from "@Calculation";
import { CarouselSpace } from "rond";

import { AttributeTable, ConstellationList, SetBonusesView, TalentList, WeaponView } from "@/components";
import { useTabs } from "@/hooks";
import {
  selectArtifacts,
  selectCharacter,
  selectTotalAttr,
  selectWeapon,
  updateCharacter,
  updateWeapon,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { useCalcTeamData } from "../ContextProvider";

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
  const calcTeamData = useCalcTeamData();

  return (
    <TalentList
      key={calcTeamData.activeMember.name}
      teamData={calcTeamData}
      onChangeTalentLevel={(type, level) => {
        dispatch(updateCharacter({ [type]: level }));
      }}
    />
  );
}
