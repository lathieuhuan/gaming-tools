import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect, useRef, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { CloseButton, clsx, LoadingSpin, StatsTable, VersatileSelect } from "rond";

import type { AppCharacter } from "@/types";

import { useTranslation } from "@/hooks";
import { fetchTalentDescriptions } from "@/services/app-data";
import { genSequentialOptions } from "@/utils/ui.utils";
import { NORMAL_ATTACK_ICONS } from "./config";
import { useDetailedTalents } from "./useDetailedTalents";

// Component
import { HintText } from "@/components/Text";
import { AbilityCarousel } from "../components/AbilityCarousel";

type TabType = "description" | "attributes";

type TalentDetailProps = {
  character: AppCharacter;
  detailIndex: number;
  onChangeDetailIndex: (newIndex: number) => void;
  onClose: () => void;
};

export function TalentDetail({
  character,
  detailIndex,
  onChangeDetailIndex,
  onClose,
}: TalentDetailProps) {
  const { t } = useTranslation();
  const { weaponType, vision, activeTalents, passiveTalents } = character;
  const { ES, EB, altSprint } = activeTalents;
  const isPassiveTalent = detailIndex > Object.keys(activeTalents).length - 1;
  const images = [NORMAL_ATTACK_ICONS[`${weaponType}_${vision}`] || "", ES.image, EB.image];

  const [talentLevel, setTalentLevel] = useState(1);
  const [tab, setTab] = useState<TabType>("attributes");
  const intervalRef = useRef<NodeJS.Timeout>();

  const {
    isLoading,
    isError,
    data: descriptions,
  } = useQuery({
    queryKey: ["talent-description", character.code],
    queryFn: () => fetchTalentDescriptions(character.code),
    enabled: tab === "description",
    staleTime: Infinity,
  });

  if (altSprint) {
    images.push(altSprint.image);
  }
  for (const talent of passiveTalents) {
    images.push(talent.image);
  }

  useLayoutEffect(() => {
    // Passive talents have no Skill Attributes
    if (isPassiveTalent && tab === "attributes") {
      setTab("description");
    }
  }, [isPassiveTalent]);

  const talents = useDetailedTalents(character, talentLevel, t);

  const talent = talents[detailIndex];
  const levelable = talent?.type !== "altSprint";

  const onClickBack = () => {
    onChangeDetailIndex(detailIndex - 1);
  };

  const onClickNext = () => {
    onChangeDetailIndex(detailIndex + 1);
  };

  const onMouseDownLevelButton = (isLevelUp: boolean) => {
    let level = talentLevel;

    const adjustLevel = () => {
      if (isLevelUp ? level < 15 : level > 1) {
        setTalentLevel((prev) => {
          level = isLevelUp ? prev + 1 : prev - 1;
          return level;
        });
      }
    };

    adjustLevel();
    intervalRef.current = setInterval(adjustLevel, 150);
  };

  const renderLevelButton = (isLevelUp: boolean, disabled: boolean) => {
    return (
      <button
        className={
          "w-7 h-7 flex-center rounded border-2 border-dark-line text-dark-line text-xlp " +
          (disabled ? "opacity-50" : "hover:border-secondary-1 hover:text-secondary-1")
        }
        disabled={disabled}
        onMouseDown={() => onMouseDownLevelButton(isLevelUp)}
        onMouseUp={() => clearInterval(intervalRef.current)}
        onMouseLeave={() => clearInterval(intervalRef.current)}
      >
        <FaCaretDown className={isLevelUp ? "rotate-180" : ""} />
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="hide-scrollbar">
        <AbilityCarousel
          className="pt-1 pb-2"
          label={talent.label}
          currentIndex={detailIndex}
          images={images}
          vision={vision}
          onClickBack={onClickBack}
          onClickNext={onClickNext}
        />

        <p className={`text-lg font-semibold text-${vision} text-center`}>{talent.name}</p>
        <div className="w-full flex rounded-full overflow-hidden divide-x-2 divide-dark-3">
          <Tab
            data-slot="tab-option"
            data-value="description"
            active={tab === "description"}
            onClick={() => setTab("description")}
          >
            Talent Info
          </Tab>
          <Tab
            data-slot="tab-option"
            data-value="attributes"
            active={tab === "attributes"}
            disabled={isPassiveTalent}
            onClick={() => setTab("attributes")}
          >
            Skill Attributes
          </Tab>
        </div>

        {tab === "attributes" ? (
          <div>
            <div className="py-2 flex-center bg-dark-1 sticky -top-1">
              {levelable ? (
                <div className="flex items-center space-x-4">
                  {renderLevelButton(false, talentLevel <= 1)}
                  <div className="flex items-center text-lg">
                    <p>Lv.</p>
                    <VersatileSelect
                      title="Select Level"
                      className="w-12 font-bold text-lg"
                      align="right"
                      transparent
                      value={talentLevel}
                      options={genSequentialOptions(15)}
                      onChange={(value) => setTalentLevel(+value)}
                    />
                  </div>
                  {renderLevelButton(true, talentLevel >= 15)}
                </div>
              ) : (
                <p className="text-lg">
                  Lv. <span className="font-bold">1</span>
                </p>
              )}
            </div>

            <StatsTable>
              {talent.stats.map((stat, i) => {
                return (
                  <StatsTable.Row key={i} className="pb-1 text-sm">
                    <p className="pr-6">{stat.name}</p>
                    <p className="font-semibold text-right">{stat.value}</p>
                  </StatsTable.Row>
                );
              })}
            </StatsTable>
          </div>
        ) : (
          <p className={isLoading ? "py-4 flex justify-center" : "mt-4 whitespace-pre-wrap"}>
            <LoadingSpin active={isLoading} />
            {isError && <HintText>Error. Rebooting...</HintText>}
            {descriptions?.[detailIndex]}
          </p>
        )}
      </div>

      <div className="mt-3">
        <CloseButton className="mx-auto" size="small" onClick={onClose} />
      </div>
    </div>
  );
}

function Tab({
  className,
  active,
  ...restProps
}: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        "w-1/2 py-0.5 text-black font-bold flex-center disabled:opacity-disabled",
        active ? "bg-heading" : "bg-light-1 glow-on-hover",
      )}
      {...restProps}
    />
  );
}
