import { useState } from "react";
import { CharacterLabel } from "./CharacterLabel";
import { CharacterToBeSorted } from "./utils";

type MarkedListProps = {
  characters: CharacterToBeSorted[];
  onChange: (characters: CharacterToBeSorted[]) => void;
};

export function MarkedList({ characters, onChange }: MarkedListProps) {
  const [markedList, setMarkedList] = useState<CharacterToBeSorted[]>([]);
  const unmarkedList = characters.filter((character) => !markedList.includes(character));

  const handleLabelMark = (character: CharacterToBeSorted) => {
    const alreadyMarkedIndex = markedList.findIndex((marked) => marked.index === character.index);

    if (alreadyMarkedIndex !== -1) {
      // Reserve only item from 0 to before the already marked item
      const newList = [...markedList].splice(0, alreadyMarkedIndex);

      setMarkedList(newList);
      onChange(newList.concat(characters.filter((character) => !newList.includes(character))));
      return;
    }

    const newList = markedList.concat(character);

    setMarkedList(newList);
    onChange(newList.concat(unmarkedList.filter((unmarked) => unmarked.index !== character.index)));
  };

  return (
    <div>
      {markedList.map((character, i) => {
        return (
          <CharacterLabel
            key={character.name}
            character={character}
            marker={i + 1}
            onClick={() => handleLabelMark(character)}
          />
        );
      })}
      {unmarkedList.map((character) => {
        return (
          <CharacterLabel
            key={character.name}
            character={character}
            onClick={() => handleLabelMark(character)}
          />
        );
      })}
    </div>
  );
}
