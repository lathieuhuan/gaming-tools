import { useState } from "react";
import { FaInfo } from "react-icons/fa";
import { Button, CarouselSpace, type ClassValue, VersatileSelect } from "rond";

import type { Character } from "@/models";
import type { ElementType, LevelableTalentType } from "@/types";

import { LEVELABLE_TALENT_TYPES } from "@/constants/global";
import { genSequentialOptions } from "@/utils/pure.utils";
import { NORMAL_ATTACK_ICONS } from "./config";

// Component
import { AbilityIcon } from "../components/AbilityIcon";
import { TalentDetail } from "./TalentDetail";

// TODO: update logic, we no longer have 3 passives

type TalentListProps = {
  className?: ClassValue;
  character: Character;
  /** Default true */
  mutable?: boolean;
  onChangeTalentLevel?: (talentType: LevelableTalentType, newLevel: number) => void;
};

export function TalentList({
  className,
  character,
  mutable = true,
  onChangeTalentLevel,
}: TalentListProps) {
  const [atDetail, setAtDetail] = useState(false);
  const [detailIndex, setDetailIndex] = useState(-1);

  const { weaponType, vision, activeTalents, passiveTalents } = character.data;
  const { altSprint } = activeTalents;
  const elmtText = `text-${vision}`;
  const numOfActives = Object.keys(activeTalents).length;

  const onClickInfoSign = (index: number) => {
    setAtDetail(true);
    setDetailIndex(index);
  };

  const staticLevelNode = <p className={`ml-1 ${elmtText} font-bold`}>1</p>;

  return (
    <CarouselSpace current={atDetail ? 1 : 0} className={className}>
      <div className="h-full hide-scrollbar flex flex-col space-y-3">
        {LEVELABLE_TALENT_TYPES.map((talentType, index) => {
          const talent = activeTalents[talentType];
          if (!talent) return null;

          const extraLevel = character.getTotalXtraTalentLv(talentType);
          const imageSrc =
            talentType === "NAs" ? NORMAL_ATTACK_ICONS[`${weaponType}_${vision}`] : talent.image;

          const levelNode = mutable ? (
            <VersatileSelect
              title="Select Level"
              className={`w-12 ${elmtText} font-bold`}
              value={character[talentType]}
              transparent
              options={genSequentialOptions(10)}
              onChange={(value) => onChangeTalentLevel?.(talentType, +value)}
            />
          ) : (
            staticLevelNode
          );

          return (
            <TalentItem
              key={index}
              name={talent.name}
              imageSrc={imageSrc}
              vision={vision}
              extraLevel={extraLevel}
              levelNode={levelNode}
              onSeeDetail={() => onClickInfoSign(index)}
            />
          );
        })}

        {altSprint && (
          <TalentItem
            name={altSprint.name}
            imageSrc={altSprint.image}
            vision={vision}
            levelNode={staticLevelNode}
          />
        )}

        {passiveTalents.map((talent, index) => {
          const active = index === 2 || character.ascension >= (index === 0 ? 1 : 4);

          return (
            <TalentItem
              key={index}
              name={talent.name}
              imageSrc={talent.image}
              vision={vision}
              levelNode={staticLevelNode}
              active={active}
            />
          );
        })}
      </div>

      {detailIndex !== -1 && detailIndex < numOfActives + passiveTalents.length ? (
        <TalentDetail
          character={character.data}
          detailIndex={detailIndex}
          onChangeDetailIndex={setDetailIndex}
          onClose={() => {
            setAtDetail(false);
            setTimeout(() => setDetailIndex(-1), 200);
          }}
        />
      ) : null}
    </CarouselSpace>
  );
}

function TalentItem({
  name,
  imageSrc,
  active = true,
  extraLevel,
  vision,
  levelNode,
  onSeeDetail,
}: {
  name?: string;
  imageSrc?: string;
  /** Default true */
  active?: boolean;
  extraLevel?: number;
  vision: ElementType;
  levelNode?: React.ReactNode;
  onSeeDetail?: () => void;
}) {
  return (
    <div className="flex">
      <div className="shrink-0 py-1 pr-2 flex-center">
        <AbilityIcon active={active} img={imageSrc} vision={vision} />
      </div>

      <div className="pt-1 grow flex">
        <div className={"px-2" + (active ? "" : " opacity-50")}>
          <p className="font-bold">{name}</p>
          <div className="flex items-center">
            <p className="mr-1">Lv.</p>
            {levelNode}
            {extraLevel ? <p className="ml-2 font-bold text-bonus">+{extraLevel}</p> : null}
          </div>
        </div>

        <Button
          className="ml-auto shrink-0 hover:bg-primary-1"
          size="small"
          icon={<FaInfo />}
          onClick={onSeeDetail}
        />
      </div>
    </div>
  );
}
