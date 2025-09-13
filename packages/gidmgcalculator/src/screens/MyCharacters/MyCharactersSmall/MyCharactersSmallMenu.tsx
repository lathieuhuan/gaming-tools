import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { ButtonGroup, FancyBackSvg, Input, useChildListObserver, useIntersectionObserver } from "rond";

import { useSelector } from "@Store/hooks";
import { selectChosenCharacter, selectUserCharacters } from "@Store/userdb-slice";
import { $AppCharacter } from "@/services";
import { GenshinImage } from "@/components";
import { useMyCharactersModalCtrl } from "../ContextProvider";

interface MyCharactersSmallMenuProps {
  onSelect: (name: string) => void;
  onClose: () => void;
}
export function MyCharactersSmallMenu(props: MyCharactersSmallMenuProps) {
  const userChars = useSelector(selectUserCharacters);
  const chosenChar = useSelector(selectChosenCharacter);
  const modalCtrl = useMyCharactersModalCtrl();

  const [keyword, setKeyword] = useState("");

  const appCharacters = $AppCharacter.getAll();

  const { observedAreaRef: intersectObsArea, visibleMap, itemUtils } = useIntersectionObserver();
  const { observedAreaRef: listObsArea } = useChildListObserver({
    onNodesAdded: (addedNodes) => {
      for (const node of addedNodes) {
        itemUtils.observe(node as Element);
      }
    },
  });

  const shouldCheckKeyword = keyword.length >= 1;
  const lowerKeyword = keyword.toLowerCase();

  return (
    <div ref={intersectObsArea} className="h-full flex flex-col">
      {userChars.length ? (
        <div className="px-4 py-3">
          <Input className="w-1/2" placeholder="Search..." onChange={setKeyword} />
        </div>
      ) : null}

      <div ref={listObsArea} className="px-4 grow hide-scrollbar">
        {userChars.map((character) => {
          const data = appCharacters.find((appCharacter) => appCharacter.name === character.name);

          if (data) {
            const visible = visibleMap[data.code];
            const hidden = shouldCheckKeyword && !character.name.toLowerCase().includes(lowerKeyword);
            const isChosen = character.name === chosenChar;

            return (
              <button
                key={character.name}
                {...itemUtils.getProps(data.code, [
                  "w-full py-2 border-b border-surface-border flex items-center gap-3",
                  hidden && "hidden",
                ])}
                onClick={() => {
                  if (!isChosen) {
                    props.onSelect(character.name);
                  }
                  props.onClose();
                }}
              >
                <div
                  className={
                    "w-6 h-6 shrink-0 relative transition-opacity duration-300 " +
                    (visible ? "opacity-100" : "opacity-0")
                  }
                >
                  {visible && (
                    <GenshinImage
                      src={data.sideIcon}
                      fallbackCls="p-1"
                      imgCls="absolute min-w-[2.5rem] h-10 -top-4 -left-2"
                    />
                  )}
                </div>
                <span className={`font-semibold ${isChosen ? "text-active-color" : ""}`}>{character.name}</span>
              </button>
            );
          }
          return null;
        })}

        {!userChars.length && <p className="pt-8 text-center text-hint-color">No characters found</p>}
      </div>

      <ButtonGroup
        className="p-4 bg-surface-3"
        justify="end"
        buttons={[
          {
            icon: <FancyBackSvg />,
            onClick: props.onClose,
          },
          {
            children: "Add",
            icon: <FaPlus />,
            onClick: () => modalCtrl.requestAddCharacter(),
          },
        ]}
      />
    </div>
  );
}
