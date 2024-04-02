import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { BottomSheet, CarouselSpace, SwitchNode } from "rond";

import type { Character } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { useDispatch, useSelector } from "@Store/hooks";
import { chooseCharacter, selectUserCharacters, updateUserCharacter } from "@Store/userdb-slice";

// Component
import { ConstellationList, MobileBottomNav, TalentList, GenshinImage } from "@Src/components";
import { PanelAttributes } from "./PanelAttributes";
import { PanelGears } from "./PanelGears";

interface CharacterInfoSmallProps {
  char: Character;
}
export function CharacterInfoSmall({ char }: CharacterInfoSmallProps) {
  const dispatch = useDispatch();
  const [activePanelI, setActivePanelI] = useState(0);
  const [optionsActive, setOptionsActive] = useState(false);

  const closeCharList = () => setOptionsActive(false);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 grow hide-scrollbar bg-surface-1">
        <SwitchNode
          value={activePanelI}
          cases={[
            { value: 0, element: <PanelAttributes /> },
            {
              value: 1,
              element: (
                <PanelGears>
                  {({ detailActive, renderGearsOverview, renderGearsDetail }) => {
                    return (
                      <CarouselSpace current={detailActive ? 1 : 0}>
                        {renderGearsOverview({
                          className: "mx-auto",
                          style: { maxWidth: "20rem" },
                        })}
                        {renderGearsDetail({ showCloseBtn: true })}
                      </CarouselSpace>
                    );
                  }}
                </PanelGears>
              ),
            },
            {
              value: 2,
              element: (
                <ConstellationList
                  className=""
                  char={char}
                  onClickIcon={(i) => {
                    dispatch(
                      updateUserCharacter({
                        name: char.name,
                        cons: char.cons === i + 1 ? i : i + 1,
                      })
                    );
                  }}
                />
              ),
            },
            {
              value: 3,
              element: (
                <TalentList
                  className=""
                  char={char}
                  onChangeTalentLevel={(type, level) => {
                    dispatch(updateUserCharacter({ name: char.name, [type]: level }));
                  }}
                />
              ),
            },
          ]}
        />
      </div>
      <MobileBottomNav
        activeI={activePanelI}
        options={["Overview", "Gears", "Constellation", "Talents"]}
        onSelect={setActivePanelI}
        extraEnd={
          <>
            <div className="my-auto w-px h-2/3 bg-surface-border" />
            <button
              type="button"
              className="shrink-0 w-10 flex-center rotate-180"
              onClick={() => setOptionsActive(true)}
            >
              <FaChevronDown />
            </button>
          </>
        }
      />

      <BottomSheet active={optionsActive} title="Switch to Character" onClose={closeCharList}>
        <CharacterList
          onSelect={(name) => {
            dispatch(chooseCharacter(name));
            closeCharList();
          }}
        />
      </BottomSheet>
    </div>
  );
}

interface CharacterListProps {
  onSelect: (name: string) => void;
}
function CharacterList(props: CharacterListProps) {
  const userChars = useSelector(selectUserCharacters);
  const allChars = $AppCharacter.getAll();

  return (
    <div>
      <div>
        {userChars.map((char) => {
          const data = allChars.find((appChar) => appChar.name === char.name);

          return data ? (
            <div key={char.name} className="flex items-center gap-2">
              <GenshinImage src={data.sideIcon} className="w-8" />
              <span>{char.name}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}
