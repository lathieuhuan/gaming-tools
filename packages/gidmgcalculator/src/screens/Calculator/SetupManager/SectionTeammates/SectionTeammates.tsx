import { useEffect, useState } from "react";
import { CollapseSpace, message } from "rond";

import { useShallowCalcStore } from "@Store/calculator";
import { selectSetup, selectSetupManager } from "@Store/calculator/selectors";
import { setTeammate, removeTeammate } from "@Store/calculator/actions";

// Component
import { CharacterPortrait, Tavern, TavernProps } from "@/components";
import { Section } from "../_components/Section";
import { CopySelect } from "./CopySelect";
import { TeammateGear } from "./TeammateGear";
import { TeammateSlot } from "./TeammateSlot";

type TavernState = {
  active: boolean;
  recruitIndex: number | null;
};

export default function SectionTeammates() {
  //
  const { isCombinedSetup, teammates, mainData } = useShallowCalcStore((state) => {
    const manager = selectSetupManager(state);
    const setup = selectSetup(state);

    return {
      isCombinedSetup: manager?.type === "combined",
      teammates: setup.teammates,
      mainData: setup.main.data,
    };
  });

  const [tavern, setTavern] = useState<TavernState>({
    active: false,
    recruitIndex: null,
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedTeammate = selectedIndex === null ? undefined : teammates[selectedIndex];

  useEffect(() => {
    if (!selectedTeammate) {
      setSelectedIndex(null);
    }
  }, [selectedTeammate]);

  const closeTavern = () => {
    setTavern({ active: false, recruitIndex: null });
  };

  const warnSetupCombined = () => {
    message.info(
      "This setup is marked as part of a Complex setup, thus teammates cannot be changed."
    );
  };

  const handleShowTavern = (recruitIndex: number) => {
    if (isCombinedSetup) {
      warnSetupCombined();
      return;
    }

    setTavern({
      active: true,
      recruitIndex,
    });
  };

  const handleRemoveTeammate = () => {
    if (isCombinedSetup) {
      warnSetupCombined();
      return;
    }

    if (selectedTeammate) {
      removeTeammate(selectedTeammate);
    }
  };

  const handleRecruitTeammate: TavernProps["onSelectCharacter"] = ({ data }) => {
    const { recruitIndex } = tavern;

    if (recruitIndex !== null) {
      setTeammate(data, recruitIndex);
      setSelectedIndex(recruitIndex);
    }
  };

  return (
    <Section className="pb-3 bg-dark-2">
      {!teammates.length && <CopySelect />}

      <div className="grid grid-cols-3">
        {[0, 1, 2].map((tmIndex) => {
          const teammate = teammates[tmIndex];

          if (teammate) {
            const active = tmIndex === selectedIndex;

            return (
              <TeammateSlot
                key={teammate.name}
                active={active}
                teammate={teammate}
                onSelect={() => setSelectedIndex(active ? null : tmIndex)}
                onRequestChange={() => handleShowTavern(tmIndex)}
                onRemove={handleRemoveTeammate}
              />
            );
          }

          // Must fill the previous slot first
          if (tmIndex && !teammates[tmIndex - 1]) {
            return null;
          }

          return (
            <div
              key={tmIndex}
              className="flex justify-center items-end"
              style={{ height: "5.25rem" }}
            >
              <CharacterPortrait
                withColorBg
                recruitable
                onClick={() => handleShowTavern(tmIndex)}
              />
            </div>
          );
        })}
      </div>

      <CollapseSpace active={selectedIndex !== null}>
        {selectedTeammate && selectedIndex !== null && (
          <TeammateGear teammate={selectedTeammate} info={selectedTeammate.data} />
        )}
      </CollapseSpace>

      <Tavern
        active={tavern.active}
        sourceType="app"
        filter={(character) =>
          character.name !== mainData.name && teammates.every((tm) => tm?.name !== character.name)
        }
        onSelectCharacter={handleRecruitTeammate}
        onClose={closeTavern}
      />
    </Section>
  );
}
