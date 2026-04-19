import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  ButtonGroup,
  FancyBackSvg,
  Input,
  useChildListObserver,
  useIntersectionObserver,
} from "rond";

import type { DbCharacter } from "@/types";

import { $AppCharacter } from "@/services";
import { useSelector } from "@Store/hooks";
import { selectActiveCharacter, selectDbCharacters } from "@Store/userdbSlice";
import { useMyCharactersModalCtrl } from "../ContextProvider";

import { GenshinImage } from "@/components";

type BottomMenuProps = {
  onSelect: (character: DbCharacter) => void;
  onClose: () => void;
};

export function BottomMenu(props: BottomMenuProps) {
  const userChars = useSelector(selectDbCharacters);
  const activeChar = useSelector(selectActiveCharacter);
  const modalCtrl = useMyCharactersModalCtrl();

  const [keyword, setKeyword] = useState("");

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
          const data = $AppCharacter.get(character.code);

          if (data) {
            const visible = visibleMap[data.code];
            const hidden = shouldCheckKeyword && !data.name.toLowerCase().includes(lowerKeyword);
            const isActive = character.code === activeChar;

            return (
              <button
                key={character.code}
                {...itemUtils.getProps(data.code, [
                  "w-full py-2 border-b border-dark-line flex items-center gap-3",
                  hidden && "hidden",
                ])}
                onClick={() => {
                  if (!isActive) {
                    props.onSelect(character);
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
                      imgCls="absolute min-w-10 h-10 -top-4 -left-2"
                    />
                  )}
                </div>
                <span className={`font-semibold ${isActive ? "text-active" : ""}`}>
                  {data.name}
                </span>
              </button>
            );
          }
          return null;
        })}

        {!userChars.length && (
          <p className="pt-8 text-center text-light-hint">No characters found</p>
        )}
      </div>

      <ButtonGroup
        className="p-4 bg-dark-3"
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
