import { useMemo, useRef, useState } from "react";
import { Modal } from "rond";

import type { AppCharacter } from "@Backend";
import type { UserCharacter } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { useStoreSnapshot } from "@Src/features";
import { findByName, pickProps } from "@Src/utils";
import { selectUserCharacters } from "@Store/userdb-slice";

// Component
import { AppEntitySelect, AppEntitySelectProps } from "./components/AppEntitySelect";
import { CharacterFilter, CharacterFilterState } from "./components/CharacterFilter";

type SelectedCharacterKey = "code" | "beta" | "name" | "icon" | "rarity" | "vision" | "weaponType";

type SelectedCharacter = Pick<AppCharacter, SelectedCharacterKey> &
  Partial<Pick<UserCharacter, "cons" | "artifactIDs">>;

export interface TavernProps extends Pick<AppEntitySelectProps, "hasMultipleMode" | "hasConfigStep"> {
  sourceType: "app" | "user" | "mixed";
  filter?: (character: SelectedCharacter) => boolean;
  onSelectCharacter: (character: SelectedCharacter) => void;
  onClose: () => void;
}
const TavernRooms = ({ sourceType, filter: filterFn, onSelectCharacter, onClose, ...templateProps }: TavernProps) => {
  const filterRef = useRef<CharacterFilterState>({
    elementTypes: [],
    weaponTypes: [],
    rarities: [],
  });

  const userChars = useStoreSnapshot(selectUserCharacters);

  const allCharacters = useMemo(() => {
    const pickedKey: SelectedCharacterKey[] = ["code", "beta", "name", "icon", "rarity", "vision", "weaponType"];
    const processedCharacters: SelectedCharacter[] = [];

    switch (sourceType) {
      case "app":
        for (const characterData of $AppCharacter.getAll()) {
          processedCharacters.push(pickProps(characterData, pickedKey));
        }
        break;
      case "user":
        for (const userChar of userChars) {
          const characterData = $AppCharacter.get(userChar.name);

          if (characterData) {
            const character = Object.assign(pickProps(characterData, pickedKey), {
              cons: userChar.cons,
              artifactIDs: userChar.artifactIDs,
            });
            processedCharacters.push(character);
          }
        }
        break;
      case "mixed":
        for (const characterData of $AppCharacter.getAll()) {
          const character = pickProps(characterData, pickedKey);
          const userCharacter = findByName(userChars, character.name);

          processedCharacters.push(Object.assign(character, userCharacter));
        }
        break;
    }

    return filterFn ? processedCharacters.filter(filterFn) : processedCharacters;
  }, []);

  const [hiddenCodes, setHiddenCodes] = useState(new Set<number>());

  const onConfirmFilter = (filter: CharacterFilterState) => {
    const newHiddenCodes = new Set<number>();
    const elementFiltered = filter.elementTypes.length !== 0;
    const weaponFiltered = filter.weaponTypes.length !== 0;
    const rarityFiltered = filter.rarities.length !== 0;

    allCharacters.forEach((character) => {
      if (
        (elementFiltered && !filter.elementTypes.includes(character.vision)) ||
        (weaponFiltered && !filter.weaponTypes.includes(character.weaponType)) ||
        (rarityFiltered && !filter.rarities.includes(character.rarity))
      ) {
        newHiddenCodes.add(character.code);
      }
    });
    setHiddenCodes(newHiddenCodes);
    filterRef.current = filter;
  };

  return (
    <AppEntitySelect
      title="Tavern"
      data={allCharacters}
      hiddenCodes={hiddenCodes}
      emptyText="No characters found"
      hasSearch
      hasFilter
      shouldHideSelected={templateProps.hasMultipleMode}
      renderFilter={(setFilterOn) => {
        return (
          <CharacterFilter
            className="h-full"
            initialFilter={filterRef.current}
            onCancel={() => setFilterOn(false)}
            onDone={(filter) => {
              onConfirmFilter(filter);
              setFilterOn(false);
            }}
          />
        );
      }}
      onChange={(character) => {
        if (character) onSelectCharacter(character);
        return true;
      }}
      onClose={onClose}
      {...templateProps}
    />
  );
};

export const Tavern = Modal.coreWrap(TavernRooms, { preset: "large" });
