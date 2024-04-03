import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { ButtonGroup, Input, useIntersectionObserver } from "rond";

import { useSelector } from "@Store/hooks";
import { selectChosenCharacter, selectUserCharacters } from "@Store/userdb-slice";
import { $AppCharacter } from "@Src/services";
import { GenshinImage } from "@Src/components";
import { useMyCharactersModalCtrl } from "../MyCharactersModalsProvider";

interface MyCharactersSmallMenuProps {
  onSelect: (name: string) => void;
  onClose: () => void;
}
export function MyCharactersSmallMenu(props: MyCharactersSmallMenuProps) {
  const userChars = useSelector(selectUserCharacters);
  const chosenChar = useSelector(selectChosenCharacter);
  const modalCtrl = useMyCharactersModalCtrl();
  const [keyword, setKeyword] = useState("");
  const appChars = $AppCharacter.getAll();

  const { observedAreaRef, visibleMap, itemUtils } = useIntersectionObserver();

  const shouldCheckKeyword = keyword.length >= 1;
  const lowerKeyword = keyword.toLowerCase();

  // console.log(visibleMap);

  return (
    <div ref={observedAreaRef} className="h-full flex flex-col">
      <div className="px-4 py-3">
        <Input className="w-1/2 px-2 py-1" placeholder="Search..." onChange={setKeyword} />
      </div>

      <div className="px-4 grow hide-scrollbar">
        {userChars.map((char) => {
          const data = appChars.find((appChar) => appChar.name === char.name);

          if (data) {
            // const visible = visibleMap[data.code];
            const hidden = shouldCheckKeyword && !char.name.toLowerCase().includes(lowerKeyword);
            const isChosen = char.name === chosenChar;

            return (
              <button
                key={char.name}
                {...itemUtils.getProps(data.code, [
                  "w-full py-2 border-b border-surface-border flex items-center gap-2",
                  hidden && "hidden",
                ])}
                onClick={() => {
                  if (!isChosen) {
                    props.onSelect(char.name);
                  }
                  props.onClose();
                }}
              >
                {/* {visible && <GenshinImage src={data.sideIcon} className="w-6 h-6 shrink-0" fallbackCls="p-1" />} */}
                <GenshinImage src={data.sideIcon} className="w-6 h-6 shrink-0" fallbackCls="p-1" />
                <span className={`font-medium ${isChosen ? "text-active-color" : ""}`}>{char.name}</span>
              </button>
            );
          }
          return null;
        })}
      </div>

      <ButtonGroup
        className="p-4 bg-surface-3"
        justify="end"
        buttons={[
          {
            children: "Add",
            icon: <FaPlus />,
            onClick: () => {
              modalCtrl.requestAddCharacter();
            },
          },
        ]}
      />
    </div>
  );
}
