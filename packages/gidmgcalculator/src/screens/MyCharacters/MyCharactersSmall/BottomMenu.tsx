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

import { GenshinImage } from "@/components/GenshinImage";

type BottomMenuProps = {
  onSelect: (character: DbCharacter) => void;
  onClose: () => void;
};

export function BottomMenu(props: BottomMenuProps) {
  const userChars = useSelector(selectDbCharacters);
  const activeChar = useSelector(selectActiveCharacter);
  const modalCtrl = useMyCharactersModalCtrl();

  const [keyword, setKeyword] = useState("");

  const { container, observe, unobserve } = useIntersectionObserver();

  const { observedAreaRef: listObsArea } = useChildListObserver({
    onNodesAdded(addedNodes) {
      addedNodes.forEach((node) => observe(node as Element));
    },
    onNodesRemoved(removedNodes) {
      removedNodes.forEach((node) => unobserve(node as Element));
    },
  });

  const shouldCheckKeyword = keyword.length >= 1;
  const lowerKeyword = keyword.toLowerCase();

  return (
    <div ref={container.ref} className="h-full flex flex-col">
      {userChars.length ? (
        <div className="px-4 py-3">
          <Input className="w-1/2" placeholder="Search..." onChange={setKeyword} />
        </div>
      ) : null}

      <div className="grow hide-scrollbar">
        <div ref={listObsArea} className="px-4 peer">
          {userChars.map((character) => {
            const data = $AppCharacter.get(character.code);
            if (!data) return null;

            const viewed = container.isItemViewed(data.code);
            const hidden = shouldCheckKeyword && !data.name.toLowerCase().includes(lowerKeyword);
            const active = character.code === activeChar;

            return (
              <button
                key={character.code}
                className="w-full py-2 border-b border-dark-line flex items-center gap-3"
                hidden={hidden}
                onClick={() => {
                  if (!active) {
                    props.onSelect(character);
                  }
                  props.onClose();
                }}
                {...container.itemAttributes(data.code)}
              >
                <div
                  className={
                    "w-6 h-6 shrink-0 relative transition-opacity duration-300 " +
                    (viewed ? "opacity-100" : "opacity-0")
                  }
                >
                  {viewed && (
                    <GenshinImage
                      src={data.sideIcon}
                      fallbackCls="p-1"
                      imgCls="absolute min-w-10 h-10 -top-4 -left-2"
                    />
                  )}
                </div>
                <span data-active={active} className="font-semibold data-[active=true]:text-active">
                  {data.name}
                </span>
              </button>
            );
          })}
        </div>

        <p className="pt-8 text-center text-light-hint peer-has-[>:not([hidden])]:hidden">
          No characters found
        </p>
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
