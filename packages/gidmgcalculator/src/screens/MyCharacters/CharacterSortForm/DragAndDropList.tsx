import { useState } from "react";
import { FaSort } from "react-icons/fa";

import { CharacterLabel } from "./CharacterLabel";
import { CharacterToBeSorted } from "./utils";

type DragAndDropListProps = {
  characters: CharacterToBeSorted[];
  onChange: (characters: CharacterToBeSorted[]) => void;
};

export function DragAndDropList({ characters, onChange }: DragAndDropListProps) {
  const [dragIndex, setDragIndex] = useState(-1);
  const [dropIndex, setDropIndex] = useState(-10);

  const canShowEmptySlot = dragIndex !== dropIndex && dragIndex + 1 !== dropIndex;

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (e) => {
    setDragIndex(Number(e.currentTarget.dataset.index));
  };

  const handleDragEnter: React.DragEventHandler<HTMLDivElement> = (e) => {
    setDropIndex(Number(e.currentTarget.dataset.index));
  };

  const handleDragEnd = () => {
    if (dropIndex !== null && dragIndex !== null && dropIndex !== dragIndex) {
      const newOrder = [...characters];
      const insertIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
      const [draggedCharacter] = newOrder.splice(dragIndex, 1);

      newOrder.splice(insertIndex, 0, draggedCharacter);
      onChange(newOrder);
    }

    setDragIndex(-1);
    setDropIndex(-10);
  };

  return (
    <div>
      {characters.map((character, index) => {
        return (
          <CharacterLabel
            key={character.name}
            data-index={index}
            character={character}
            withEmptySlot={canShowEmptySlot && index === dropIndex}
            draggable
            marker={<FaSort className="text-xl" />}
            onDragStart={handleDragStart}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
          />
        );
      })}
    </div>
  );
}
