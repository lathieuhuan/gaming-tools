import { useEffect, useState } from "react";
import { clsx, CollapseSpace, message } from "rond";

import Array_ from "@Src/utils/array-utils";
import {
  addTeammate,
  removeTeammate,
  selectActiveId,
  selectSetupManageInfos,
  selectTeammates,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { useTeamData } from "../../ContextProvider";

// Component
import { CharacterPortrait, Tavern, TavernProps } from "@Src/components";
import { CopySelect } from "./CopySelect";
import { TeammateGear } from "./TeammateGear";
import { TeammateSlot } from "./TeammateSlot";

type TavernState = {
  active: boolean;
  recruitedIndex: number;
};

type SectionTeammatesProps = {
  className?: string;
};

export default function SectionTeammates({ className }: SectionTeammatesProps) {
  const dispatch = useDispatch();
  const activeSetupId = useSelector(selectActiveId);
  const setupManageInfos = useSelector(selectSetupManageInfos);
  const teammates = useSelector(selectTeammates);
  const teamData = useTeamData();

  const [tavern, setTavern] = useState<TavernState>({
    active: false,
    recruitedIndex: 0,
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { activeAppMember } = teamData;
  const isCombinedSetup = Array_.findById(setupManageInfos, activeSetupId)?.type === "combined";
  const selectedTeammate = selectedIndex === null ? undefined : teammates[selectedIndex];

  useEffect(() => {
    if (!selectedTeammate) {
      setSelectedIndex(null);
    }
  }, [selectedTeammate]);

  const closeTavern = () => {
    setTavern({ active: false, recruitedIndex: 0 });
  };

  const warnSetupCombined = () => {
    message.info("This setup is marked as part of a Complex setup, thus teammates cannot be changed.");
  };

  const handleShowTavern = (recruitedIndex: number) => {
    if (isCombinedSetup) {
      warnSetupCombined();
      return;
    }

    setTavern({
      active: true,
      recruitedIndex,
    });
  };

  const handleRemoveTeammate = () => {
    if (isCombinedSetup) {
      warnSetupCombined();
      return;
    }

    if (selectedIndex !== null) {
      dispatch(removeTeammate(selectedIndex));
    }
  };

  const handleRecruitTeammate: TavernProps["onSelectCharacter"] = (character) => {
    const { recruitedIndex } = tavern;

    if (recruitedIndex !== null) {
      dispatch(
        addTeammate({
          name: character.name,
          elementType: character.vision,
          weaponType: character.weaponType,
          teammateIndex: recruitedIndex,
        })
      );
      setSelectedIndex(recruitedIndex);
    }
  };

  return (
    <div className={clsx("pb-3 bg-surface-2", className)}>
      {teammates.length && teammates.every((teammate) => !teammate) ? <CopySelect /> : null}

      <div className="grid grid-cols-3">
        {teammates.map((teammate, tmIndex) => {
          if (teammate) {
            const active = tmIndex === selectedIndex;

            return (
              <TeammateSlot
                key={teammate.name}
                active={active}
                info={teamData.getAppMember(teammate.name)}
                onSelect={() => setSelectedIndex(active ? null : tmIndex)}
                onRequestChange={() => handleShowTavern(tmIndex)}
                onRemove={handleRemoveTeammate}
              />
            );
          }

          return (
            <div key={tmIndex} className="flex justify-center items-end" style={{ height: "5.25rem" }}>
              <CharacterPortrait withColorBg recruitable onClick={() => handleShowTavern(tmIndex)} />
            </div>
          );
        })}
      </div>

      <CollapseSpace active={selectedIndex !== null}>
        {selectedTeammate && selectedIndex !== null && (
          <TeammateGear
            teammate={selectedTeammate}
            index={selectedIndex}
            weaponType={teamData.getAppMember(selectedTeammate.name).weaponType}
          />
        )}
      </CollapseSpace>

      <Tavern
        active={tavern.active}
        sourceType="app"
        filter={(character) =>
          character.name !== activeAppMember.name && teammates.every((tm) => tm?.name !== character.name)
        }
        onSelectCharacter={handleRecruitTeammate}
        onClose={closeTavern}
      />
    </div>
  );
}
