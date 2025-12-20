import { useState } from "react";
import { FaInfo } from "react-icons/fa";
import { Button, CarouselSpace, type ClassValue, VersatileSelect } from "rond";

import type { Character } from "@/models/base";
import type { LevelableTalentType } from "@/types";

import { TALENT_TYPES } from "@/constants/global";
import { genSequentialOptions } from "@/utils";
import { NORMAL_ATTACK_ICONS } from "./_constants";

// Component
import { AbilityIcon } from "../_components/AbilityIcon";
import { TalentDetail } from "./TalentDetail";

type RenderedTalentConfig = {
  name?: string;
  image?: string;
  /** Default true */
  active?: boolean;
  xtraLevel?: number;
};

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
  const elmtText = `text-${vision}`;
  const numOfActives = Object.keys(activeTalents).length;

  const onClickInfoSign = (index: number) => {
    setAtDetail(true);
    setDetailIndex(index);
  };

  const renderTalent = (
    talent: RenderedTalentConfig,
    index: number,
    levelNode: React.ReactNode
  ) => {
    const { active = true } = talent;
    return (
      <div key={index} className="flex">
        <div className="shrink-0 py-1 pr-2 flex-center">
          <AbilityIcon active={active} img={talent.image} vision={vision} />
        </div>

        <div className="pt-1 grow flex">
          <div className={"px-2" + (active ? "" : " opacity-50")}>
            <p className="font-bold">{talent.name}</p>
            <div className="flex items-center">
              <p className="mr-1">Lv.</p>
              {levelNode}
              {talent.xtraLevel ? (
                <p className="ml-2 font-bold text-bonus">+{talent.xtraLevel}</p>
              ) : null}
            </div>
          </div>

          <Button
            className="ml-auto shrink-0 hover:bg-primary-1"
            size="small"
            icon={<FaInfo />}
            onClick={() => onClickInfoSign(index)}
          />
        </div>
      </div>
    );
  };

  const immutableLvNode = <p className={`ml-1 ${elmtText} font-bold`}>1</p>;

  return (
    <CarouselSpace current={atDetail ? 1 : 0} className={className}>
      <div className="h-full hide-scrollbar flex flex-col space-y-3">
        {TALENT_TYPES.map((talentType, index) => {
          const isAltSprint = talentType === "altSprint";
          const talent = activeTalents[talentType];
          if (!talent) return null;

          const xtraLevel = character.getTotalXtraTalentLv(talentType);

          const mutableLvNode = (
            <VersatileSelect
              title="Select Level"
              className={`w-12 ${elmtText} font-bold`}
              value={isAltSprint ? 1 : character[talentType]}
              transparent
              options={genSequentialOptions(10)}
              onChange={(value) => (isAltSprint ? null : onChangeTalentLevel?.(talentType, +value))}
            />
          );

          return renderTalent(
            {
              name: talent.name,
              image:
                talentType === "NAs"
                  ? NORMAL_ATTACK_ICONS[`${weaponType}_${vision}`]
                  : talent.image,
              xtraLevel,
            },
            index,
            isAltSprint || !mutable ? immutableLvNode : mutableLvNode
          );
        })}

        {passiveTalents.map((talent, index) => {
          const active = index === 2 || character.ascension >= (index === 0 ? 1 : 4);
          return renderTalent(
            {
              name: talent.name,
              image: talent.image,
              active,
            },
            numOfActives + index,
            immutableLvNode
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
