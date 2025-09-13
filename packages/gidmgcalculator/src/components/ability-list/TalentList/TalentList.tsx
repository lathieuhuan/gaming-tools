import { useState } from "react";
import { FaInfo } from "react-icons/fa";
import { Button, CarouselSpace, type ClassValue, VersatileSelect } from "rond";
import { TALENT_TYPES, LevelableTalentType, GeneralCalc, CalcTeamData } from "@Calculation";

import { genSequentialOptions } from "@/utils";
import NORMAL_ATTACK_ICONS from "./normal-attack-icons";

// Component
import { AbilityIcon } from "../ability-list-components";
import { TalentDetail } from "./TalentDetail";

type RenderedTalentConfig = {
  name?: string;
  image?: string;
  /** Default to true */
  active?: boolean;
  xtraLevel?: number;
};

interface TalentListProps {
  className?: ClassValue;
  teamData: CalcTeamData;
  /** Default to true */
  mutable?: boolean;
  onChangeTalentLevel?: (talentType: LevelableTalentType, newLevel: number) => void;
}
export function TalentList(props: TalentListProps) {
  const { teamData, mutable = true } = props;
  const { activeMember, activeAppMember } = teamData;
  const [atDetail, setAtDetail] = useState(false);
  const [detailIndex, setDetailIndex] = useState(-1);

  const { weaponType, vision, activeTalents, passiveTalents } = activeAppMember;
  const elmtText = `text-${vision}`;
  const numOfActives = Object.keys(activeTalents).length;

  const onClickInfoSign = (index: number) => {
    setAtDetail(true);
    setDetailIndex(index);
  };

  const renderTalent = (talent: RenderedTalentConfig, index: number, levelNode: React.ReactNode) => {
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
              {talent.xtraLevel ? <p className="ml-2 font-bold text-bonus-color">+{talent.xtraLevel}</p> : null}
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
    <CarouselSpace current={atDetail ? 1 : 0} className={props.className}>
      <div className="h-full hide-scrollbar flex flex-col space-y-3">
        {TALENT_TYPES.map((talentType, index) => {
          const isAltSprint = talentType === "altSprint";
          const talent = activeTalents[talentType];
          if (!talent) return null;

          const xtraLevel = teamData.getTotalXtraTalentLv(talentType);

          const mutableLvNode = (
            <VersatileSelect
              title="Select Level"
              className={`w-12 ${elmtText} font-bold`}
              value={isAltSprint ? 1 : activeMember[talentType]}
              transparent
              options={genSequentialOptions(10)}
              onChange={(value) => (isAltSprint ? null : props.onChangeTalentLevel?.(talentType, +value))}
            />
          );

          return renderTalent(
            {
              name: talent.name,
              image: talentType === "NAs" ? NORMAL_ATTACK_ICONS[`${weaponType}_${vision}`] : talent.image,
              xtraLevel,
            },
            index,
            isAltSprint || !mutable ? immutableLvNode : mutableLvNode
          );
        })}

        {passiveTalents.map((talent, index) => {
          const active = index === 2 || GeneralCalc.getAscension(activeMember.level) >= (index === 0 ? 1 : 4);
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

      {detailIndex !== -1 && detailIndex < numOfActives + activeAppMember.passiveTalents.length ? (
        <TalentDetail
          appCharacter={activeAppMember}
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
