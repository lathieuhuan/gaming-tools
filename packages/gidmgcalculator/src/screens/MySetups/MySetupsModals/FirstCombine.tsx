import { useState, KeyboardEventHandler, FormEvent } from "react";
import { Input } from "rond";

import type { UserSetup } from "@Src/types";
import { selectUserSetups, combineSetups } from "@Store/userdb-slice";
import { useDispatch } from "@Store/hooks";
import { useStoreSnapshot } from "@Src/features";
import { Setup_, findById } from "@Src/utils";
import { useCombineManager } from "./hooks";

export default function FirstCombine({ onClose }: { onClose: () => void }) {
  const dispatch = useDispatch();
  const userSetups = useStoreSnapshot(selectUserSetups);

  const [input, setInput] = useState("Team Setup");

  const setupOptions = userSetups.filter((setup) => {
    return setup.type === "original" && setup.party.length === 3 && setup.party.every((teammate) => teammate);
  }) as UserSetup[];

  const { isError, pickedIDs, combineMenu, setIsError } = useCombineManager({
    options: setupOptions,
    limit: 4,
  });

  const tryCombine = () => {
    if (pickedIDs.length < 2) {
      return;
    }
    if (!input) {
      setIsError(true);
      return;
    }

    const mains: string[] = [];
    const all: string[] = [];

    for (const ID of pickedIDs) {
      const { char, party } = findById(setupOptions, ID)!;

      if (mains.includes(char.name)) {
        setIsError(true);
        return;
      } else {
        mains.push(char.name);
      }

      if (!all.includes(char.name)) {
        if (all.length === 4) {
          setIsError(true);
          return;
        } else {
          all.push(char.name);
        }
      }

      for (const teammate of Setup_.teammatesOf(party)) {
        if (!all.includes(teammate.name)) {
          if (all.length === 4) {
            setIsError(true);
            return;
          } else {
            all.push(teammate.name);
          }
        }
      }
    }
    dispatch(combineSetups({ pickedIDs, name: input }));
    onClose();
  };

  const onKeydownInput: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      tryCombine();
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    tryCombine();
  };

  return (
    <form id="setup-combine" className="h-full flex flex-col break-words" onSubmit={onSubmit}>
      <p className={"px-2 " + (isError ? "text-red-100" : "text-light-800")}>
        {isError ? "You cannot combine these setups." : "Choose at least 2 setups with the same party members."}
      </p>

      <div className="mt-2 px-2 grow custom-scrollbar">{combineMenu}</div>

      <div className="mt-4">
        <Input
          className="px-4 py-1 w-full text-xl text-center font-bold"
          value={input}
          maxLength={32}
          onKeyDown={onKeydownInput}
          onChange={setInput}
        />
      </div>
    </form>
  );
}
