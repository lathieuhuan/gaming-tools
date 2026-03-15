import { useState } from "react";
import { MdCheck, MdContentCopy } from "react-icons/md";
import { Button, CarouselSpace } from "rond";
import { CORE_STAT_TYPES, ATTACK_ELEMENTS } from "@/constants/global";
import { useTranslation } from "@/hooks";

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
  const { t } = useTranslation();
  const main = useCalcStore(selectActiveMain);
  const [copied, setCopied] = useState(false);

  const onCopyStats = () => {
    const { finals } = main.allAttrsCtrl;
    let text = `${main.data.name}\nLevel ${main.level}\nC${main.cons}\n\nAttributes\n`;

    for (const type of CORE_STAT_TYPES) {
      text += `${t(type)}\t${finals.get(type)}\n`;
    }

    const em = finals.get("em");
    if (em !== 0) {
      text += `${t("em")}\t${em}\n`;
    }

    const percentStats = [
      "cRate_",
      "cDmg_",
      "er_",
      "healB_",
      "inHealB_",
      "shieldS_",
      ...ATTACK_ELEMENTS,
      "naAtkSpd_",
      "caAtkSpd_",
    ] as const;

    for (const type of percentStats) {
      const value = finals.get(type);
      if (value !== 0) {
        text += `${t(type)}\t${Math.round(value * 10) / 10}%\n`;
      }
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end p-2 pb-0">
        <Button
          boneOnly
          size="custom"
          className={`w-7 h-7 text-lg ${copied ? "text-green-500" : "text-light-4"}`}
          icon={copied ? <MdCheck /> : <MdContentCopy />}
          onClick={onCopyStats}
        />
      </div>
      <div className="grow custom-scrollbar">
        <AttributeTable attributes={main.allAttrsCtrl.finals} />
      </div>
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
