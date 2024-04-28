import { CarouselSpace } from "rond";
import { ArtifactAttributeControl, TotalAttribute } from "@Backend";
import type { RootState } from "@Store/store";

import { useTabs } from "@Src/hooks";
import { Calculation_ } from "@Src/utils";
import { useDispatch, useSelector } from "@Store/hooks";
import {
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

const selectArtInfo = (state: RootState) => {
  const { activeId, setupsById, resultById } = state.calculator;
  const { totalAttrs } = resultById[activeId];
  const { artifacts } = setupsById[activeId];
  const artAttr = new ArtifactAttributeControl(artifacts, totalAttrs).getValues();

  const attr = {} as TotalAttribute;

  for (const [key, value] of Object.entries(artAttr)) {
    attr[key as keyof TotalAttribute] = {
      total: value,
    };
  }
  return {
    artAttr: attr,
    artifacts,
  };
};

export function ArtifactsTab() {
  const { artAttr, artifacts } = useSelector(selectArtInfo);

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
          <SetBonusesView setBonuses={Calculation_.getArtifactSetBonuses(artifacts)} noTitle />
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
