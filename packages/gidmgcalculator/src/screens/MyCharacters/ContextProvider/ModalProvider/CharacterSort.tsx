import { createSelector } from "@reduxjs/toolkit";
import { useState } from "react";
import { FaChevronDown, FaSort } from "react-icons/fa";
import { CarouselSpace, Modal, Popover } from "rond";

import { $AppCharacter } from "@/services";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import Array_ from "@/utils/Array";
import Entity_ from "@/utils/Entity";
import { useDispatch } from "@Store/hooks";
import { selectUserCharacters, sortCharacters } from "@Store/userdb-slice";

const selectCharacterToBeSorted = createSelector(selectUserCharacters, (userChars) =>
  userChars.map((character, index) => {
    const { name, rarity } = $AppCharacter.get(character.name);
    return { name, level: character.level, rarity, index };
  })
);

interface LineProps extends React.HTMLAttributes<HTMLDivElement> {
  character: { name: string; level: string; rarity: number; index: number };
  marker?: React.ReactNode;
  visiblePlot?: boolean;
}
const Line = ({ character, marker, visiblePlot, ...rest }: LineProps) => {
  return (
    <div key={character.name} className="flex flex-col cursor-default select-none" {...rest}>
      <div className="px-2 py-1 h-10 bg-dark-3" hidden={!visiblePlot}></div>

      <div className="px-2 py-1 flex items-center hover:bg-dark-2">
        <div className="w-8 h-8 mr-2 flex-center text-light-1 pointer-events-none">{marker}</div>

        <p className="pointer-events-none text-light-1">
          <span className={`text-rarity-${character.rarity}`}>{character.name}</span> (Lv. {character.level})
        </p>
      </div>
    </div>
  );
};

function SortCore({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();

  const toBeSorted = useStoreSnapshot(selectCharacterToBeSorted);

  const [list, setList] = useState(toBeSorted);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [markedList, setMarkedList] = useState<number[]>([]);
  const [inMarkingMode, setInMarkingMode] = useState(false);

  const onSortByName = () => {
    setList((prev) => {
      const newList = [...prev];
      newList.sort((a, b) => a.name.localeCompare(b.name));

      return newList;
    });
  };

  const onSortByLevel = () => {
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

  const onSortByRarity = () => {
    setList((prev) => {
      const newList = [...prev];

      return newList.sort((a, b) => b.rarity - a.rarity);
    });
  };

  const onDragStart: React.DragEventHandler = (e) => {
    setDragIndex(+e.currentTarget.id);
  };

  const onDragEnter: React.DragEventHandler = (e) => {
    setDropIndex(+e.currentTarget.id);
  };

  const onDragOver: React.DragEventHandler = (e) => {
    e.preventDefault();
  };
  const onDrop = () => {
    if (dropIndex !== null && dragIndex !== null && dropIndex !== dragIndex) {
      setList((prev) => {
        const newList = [...prev];
        newList.splice(dragIndex < dropIndex ? dropIndex - 1 : dropIndex, 0, newList.splice(dragIndex, 1)[0]);
        return newList;
      });
    }

    setDropIndex(null);
  };

  const onClickLine = (index: number) => {
    if (!inMarkingMode) {
      return;
    }

    setMarkedList((prevMarkedList) => {
      const exitedIndex = prevMarkedList.indexOf(index);

      if (exitedIndex !== -1) {
        return prevMarkedList.splice(0, exitedIndex);
      }

      return [...prevMarkedList, index];
    });
  };

  const onToggleMarkingMode = () => {
    setInMarkingMode(!inMarkingMode);

    if (inMarkingMode) {
      setMarkedList([]);
    }
  };

  const onConfirmOrder = () => {
    let orderedIndexes = [];

    if (inMarkingMode) {
      const remainIndexes = [];

      for (const { index } of list) {
        if (!markedList.includes(index)) {
          remainIndexes.push(index);
        }
      }

      orderedIndexes = markedList.concat(remainIndexes);
    } else {
      orderedIndexes = list.map(({ index }) => index);
    }

    dispatch(sortCharacters(orderedIndexes));
    onClose();
  };

  const quickSortOptions = [
    {
      label: "By name",
      onSelect: onSortByName,
    },
    {
      label: "By level",
      onSelect: onSortByLevel,
    },
    {
      label: "By rarity",
      onSelect: onSortByRarity,
    },
  ];

  return (
    <form
      id="sort-characters-form"
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirmOrder();
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
            className="px-1 py-2 top-full bg-dark-2 rounded group-hover:scale-100 space-y-2"
            origin="top left"
          >
            {quickSortOptions.map(({ label, onSelect }, i) => {
              return (
                <p key={i} className="px-2 py-1 rounded-sm hover:bg-dark-3" onClick={onSelect}>
                  {label}
                </p>
              );
            })}
          </Popover>
        </div>

        <div className="flex items-center">
          <span>Mode</span>
          <div className="h-full px-2 select-none" style={{ width: 120 }}>
            <CarouselSpace className="text-center cursor-default bg-dark-2 rounded" current={inMarkingMode ? 1 : 0}>
              <p className="h-full flex-center" onClick={onToggleMarkingMode}>
                Drag & drop
              </p>
              <p className="h-full flex-center" onClick={onToggleMarkingMode}>
                Mark order
              </p>
            </CarouselSpace>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar" style={{ height: "60vh" }}>
        <div>
          {inMarkingMode &&
            markedList.map((index, i) => {
              const character = Array_.findByIndex(list, index);

              if (character) {
                return (
                  <Line
                    key={character.name}
                    character={character}
                    marker={i + 1}
                    onClick={() => onClickLine(character.index)}
                  />
                );
              }

              return null;
            })}
          {inMarkingMode
            ? list
                .filter((character) => !markedList.includes(character.index))
                .map((character) => {
                  return (
                    <Line key={character.name} character={character} onClick={() => onClickLine(character.index)} />
                  );
                })
            : list.map((character, i) => {
                return (
                  <Line
                    key={character.name}
                    id={i.toString()}
                    character={character}
                    visiblePlot={i === dropIndex}
                    draggable={!inMarkingMode}
                    marker={<FaSort size="1.25rem" />}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnter={onDragEnter}
                    onDrop={onDrop}
                  />
                );
              })}
        </div>
      </div>
    </form>
  );
}

export const CharacterSort = Modal.wrap(SortCore, {
  preset: "small",
  title: "Sort characters",
  className: "bg-dark-1",
  withActions: true,
  formId: "sort-characters-form",
});
