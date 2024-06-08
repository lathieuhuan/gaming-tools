import { CarouselSpace } from "rond";
import { GeneralCalc, getArtifactAttribute } from "@Backend";

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

  const artAttr = getArtifactAttribute(artifacts, (stat) => totalAttr[`${stat}_base`]);

  const { activeIndex, renderTabs } = useTabs({
    level: 2,
    configs: [{ text: "Details" }, { text: "Set Bonus" }],
  });

  return (
    <div className="h-full flex flex-col">
      {renderTabs()}

      <CarouselSpace className="mt-3 grow" current={activeIndex}>
        <div className="h-full custom-scrollbar">
          <AttributeTable attributes={artAttr} />
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
  const char = useSelector(selectCharacter);
  return (
    <ConstellationList
      char={char}
      onClickIcon={(i) => dispatch(updateCharacter({ cons: char.cons === i + 1 ? i : i + 1 }))}
    />
  );
}

export function TalentsTab() {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const party = useSelector(selectParty);

  return (
    <TalentList
      key={char.name}
      char={char}
      onChangeTalentLevel={(type, level) => {
        dispatch(updateCharacter({ [type]: level }));
      }}
      party={party}
    />
  );
}
