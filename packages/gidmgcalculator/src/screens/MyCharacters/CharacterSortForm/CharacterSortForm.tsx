import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { CarouselSpace, Popover } from "rond";

import { useStoreSnapshot } from "@/systems/dynamic-store";
import Entity_ from "@/utils/Entity";
import { useDispatch } from "@Store/hooks";
import { sortCharacters } from "@Store/userdb-slice";
import { selectCharacterToBeSorted } from "./utils";

import { DragAndDropList } from "./DragAndDropList";
import { MarkedList } from "./MarkedList";

type CharacterSortFormProps = {
  id?: string;
  onClose: () => void;
};

export function CharacterSortForm({ id, onClose }: CharacterSortFormProps) {
  const dispatch = useDispatch();
  const toBeSorted = useStoreSnapshot(selectCharacterToBeSorted);

  const [list, setList] = useState(toBeSorted);
  const [inMarkingMode, setInMarkingMode] = useState(false);

  const handleSortByName = () => {
    setList((prev) => {
      const newList = [...prev];
      newList.sort((a, b) => a.name.localeCompare(b.name));

      return newList;
    });
  };

  const handleSortByLevel = () => {
    setList((prev) => {
      const newList = [...prev];

      return newList.sort((a, b) => {
        const [fA, sA] = Entity_.splitLv(a);
        const [fB, sB] = Entity_.splitLv(b);

        if (fA !== fB) {
          return fB - fA;
        }

        return sB - sA;
      });
    });
  };

  const handleSortByRarity = () => {
    setList((prev) => {
      const newList = [...prev];

      return newList.sort((a, b) => b.rarity - a.rarity);
    });
  };

  const handleSubmit = () => {
    dispatch(sortCharacters(list.map(({ index }) => index)));
    onClose();
  };

  const quickSortOptions = [
    {
      label: "By name",
      onSelect: handleSortByName,
    },
    {
      label: "By level",
      onSelect: handleSortByLevel,
    },
    {
      label: "By rarity",
      onSelect: handleSortByRarity,
    },
  ];

  return (
    <form
      id={id}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className="h-8 flex justify-between">
        <div className="px-4 flex group relative cursor-default">
          <p className="h-full flex items-center space-x-2">
            <span>Quick sort</span>
            <FaChevronDown className="text-sm" />
          </p>
          <Popover
            as="div"
            className="p-2 top-full bg-light-2 text-black font-bold rounded group-hover:scale-100"
            origin="top center"
          >
            {quickSortOptions.map(({ label, onSelect }, i) => {
              return (
                <p key={i} className="p-2 rounded-sm hover:bg-primary-1" onClick={onSelect}>
                  {label}
                </p>
              );
            })}
          </Popover>
        </div>

        <div className="flex items-center">
          <span>Mode</span>
          <div className="w-30 px-2 select-none">
            <div className="h-8" onClick={() => setInMarkingMode(!inMarkingMode)}>
              <CarouselSpace
                className="text-center cursor-default bg-dark-2 rounded"
                current={inMarkingMode ? 1 : 0}
              >
                <p className="h-full flex-center">Drag & drop</p>
                <p className="h-full flex-center">Mark order</p>
              </CarouselSpace>
            </div>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar h-[60vh]">
        {inMarkingMode ? (
          <MarkedList characters={list} onChange={setList} />
        ) : (
          <DragAndDropList characters={list} onChange={setList} />
        )}
      </div>
    </form>
  );
}
