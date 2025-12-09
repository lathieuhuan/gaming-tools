import { useMemo, useRef, useState } from "react";
import { Modal } from "rond";

import type { AppCharacter, IDbCharacter } from "@/types";

import { $AppCharacter } from "@/services";
import { useStoreSnapshot } from "@/systems/dynamic-store";
import Array_ from "@/utils/Array";
import { selectDbCharacters } from "@Store/userdb-slice";

// Component
import {
  AppEntityOptionModel,
  AppEntitySelect,
  AppEntitySelectProps,
} from "@/components/AppEntitySelect";
import { CharacterFilter, CharacterFilterState } from "./CharacterFilter";

export type TavernSelectedCharacter = {
  userData?: IDbCharacter;
  data: AppCharacter;
};

type CharacterOption = AppEntityOptionModel & TavernSelectedCharacter;

export type TavernProps = Pick<AppEntitySelectProps, "hasMultipleMode" | "hasConfigStep"> & {
  sourceType: "app" | "user" | "mixed";
  filter?: (character: CharacterOption) => boolean;
  onSelectCharacter: (character: TavernSelectedCharacter) => void;
  onClose: () => void;
};

const TavernHall = ({
  sourceType,
  filter: filterFn = () => true,
  onSelectCharacter,
  onClose,
  ...templateProps
}: TavernProps) => {
  const filterRef = useRef<CharacterFilterState>({
    elementTypes: [],
    weaponTypes: [],
    rarities: [],
  });

  const userChars = useStoreSnapshot(selectDbCharacters);

  const characterOptions = useMemo(() => {
    const options: CharacterOption[] = [];

    switch (sourceType) {
      case "app":
        for (const data of $AppCharacter.getAll()) {
          const option: CharacterOption = {
            name: data.name,
            icon: data.icon,
            rarity: data.rarity,
            vision: data.vision,
            code: data.code,
            data,
          };

          filterFn(option) && options.push(option);
        }
        break;
      case "user":
        for (const userChar of userChars) {
          const data = $AppCharacter.get(userChar.name);
          if (!data) continue;

          const option: CharacterOption = {
            name: data.name,
            icon: data.icon,
            rarity: data.rarity,
            vision: data.vision,
            code: data.code,
            cons: userChar.cons,
            data,
            userData: userChar,
          };

          filterFn(option) && options.push(option);
        }
        break;
      case "mixed":
        for (const data of $AppCharacter.getAll()) {
          const userChar = Array_.findByName(userChars, data.name);
          const option: CharacterOption = {
            name: data.name,
            icon: data.icon,
            rarity: data.rarity,
            vision: data.vision,
            code: data.code,
            cons: userChar?.cons,
            data,
            userData: userChar,
          };

          filterFn(option) && options.push(option);
        }
        break;
    }

    return options;
  }, []);

  const [hiddenCodes, setHiddenCodes] = useState(new Set<number>());

  const handleConfirmFilter = (filter: CharacterFilterState) => {
    const newHiddenCodes = new Set<number>();
    const elementFiltered = filter.elementTypes.length !== 0;
    const weaponFiltered = filter.weaponTypes.length !== 0;
    const rarityFiltered = filter.rarities.length !== 0;

    characterOptions.forEach(({ data }) => {
      if (
        (elementFiltered && !filter.elementTypes.includes(data.vision)) ||
        (weaponFiltered && !filter.weaponTypes.includes(data.weaponType)) ||
        (rarityFiltered && !filter.rarities.includes(data.rarity))
      ) {
        newHiddenCodes.add(data.code);
      }
    });

    setHiddenCodes(newHiddenCodes);

    filterRef.current = filter;
  };

  return (
    <AppEntitySelect
      title="Tavern"
      data={characterOptions}
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
            onConfirm={(filter) => {
              handleConfirmFilter(filter);
              setFilterOn(false);
            }}
          />
        );
      }}
      onChange={(character) => {
        if (character) {
          onSelectCharacter(character);
        }
        return true;
      }}
      onClose={onClose}
      {...templateProps}
    />
  );
};

export const Tavern = Modal.coreWrap(TavernHall, { preset: "large" });
