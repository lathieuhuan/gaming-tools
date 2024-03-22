import { useState } from "react";
import { clsx } from "rond";

import type { UserSetup } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { CharacterPortrait } from "@Src/components";

export type SetupOptions = Array<Pick<UserSetup, "ID" | "type" | "name" | "char" | "party">>;

interface UseCombineManagerArgs {
  options: SetupOptions;
  limit: number;
}

export function useCombineManager({ options, limit }: UseCombineManagerArgs) {
  const [pickedIDs, setPickedIDs] = useState<number[]>([]);
  const [isError, setIsError] = useState(false);

  const notFull = pickedIDs.length < limit;

  const onClickOption = (ID: number, picked: boolean) => {
    if (picked) {
      setPickedIDs((prev) => {
        const IDs = [...prev];
        IDs.splice(IDs.indexOf(ID), 1);
        return IDs;
      });
      setIsError(false);
    } else if (notFull) {
      setPickedIDs((prev) => [...prev, ID]);
      setIsError(false);
    }
  };

  const combineMenu = (
    <div className="space-y-3">
      {!options.length && (
        <div className="h-40 flex-center">
          <p className="pr-2 text-lg text-light-800 text-center">No setups available for choosing...</p>
        </div>
      )}
      {options.map((setup) => {
        const { ID } = setup;
        const picked = pickedIDs.includes(ID);

        return (
          <div
            key={ID}
            className={clsx(
              "p-4 rounded-lg bg-dark-900 flex flex-col md:flex-row",
              !picked && !notFull && "opacity-50",
              picked && "shadow-green-300"
            )}
            style={{ boxShadow: picked ? "0 0 5px 1px var(--tw-shadow-color) inset" : undefined }}
            onClick={() => onClickOption(ID, picked)}
          >
            <div className="md:w-40 md:mr-4">
              <p className="text-lg font-semibold text-mint-600 cursor-default">{setup.name}</p>
            </div>

            <div className="mt-2 md:mt-0 flex gap-4">
              <CharacterPortrait
                className="shadow-3px-2px shadow-light-400"
                size="small"
                info={$AppCharacter.get(setup.char.name)}
              />
              {setup.party.map((teammate, j) => {
                return teammate ? (
                  <CharacterPortrait key={j} size="small" info={$AppCharacter.get(teammate.name)} />
                ) : null;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return {
    isError,
    pickedIDs,
    combineMenu,
    setIsError,
  };
}
