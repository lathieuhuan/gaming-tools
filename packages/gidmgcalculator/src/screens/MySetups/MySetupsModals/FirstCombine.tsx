import { FormEvent, KeyboardEventHandler, useState } from "react";
import { Input } from "rond";

import { useStoreSnapshot } from "@/systems/dynamic-store";
import Array_ from "@/utils/Array";
import { isDbSetup } from "@/utils/Setup";
import { useDispatch } from "@Store/hooks";
import { combineSetups, selectUserSetups } from "@Store/userdb-slice";
import { useCombineManager } from "./hooks";

export default function FirstCombine(props: { onClose: () => void }) {
  const dispatch = useDispatch();
  const dbSetups = useStoreSnapshot(selectUserSetups);

  const [input, setInput] = useState("Team Setup");

  const setupOptions = dbSetups.filter(isDbSetup).filter((setup) => {
    return (
      setup.type === "original" &&
      setup.teammates.length === 3 &&
      setup.teammates.every((teammate) => teammate.name)
    );
  });

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
      const { main, teammates } = Array_.findById(setupOptions, ID)!;

      if (mains.includes(main.name)) {
        setIsError(true);
        return;
      } else {
        mains.push(main.name);
      }

      if (!all.includes(main.name)) {
        if (all.length === 4) {
          setIsError(true);
          return;
        } else {
          all.push(main.name);
        }
      }

      for (const teammate of teammates) {
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
    props.onClose();
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
      <p className={"px-2 " + (isError ? "text-danger-2" : "text-light-hint")}>
        {isError
          ? "You cannot combine these setups."
          : "Choose at least 2 setups with the same party members."}
      </p>

      <div className="mt-2 px-2 grow custom-scrollbar">{combineMenu}</div>

      <div className="mt-4">
        <Input
          className="w-full text-center font-semibold"
          size="medium"
          value={input}
          maxLength={32}
          onKeyDown={onKeydownInput}
          onChange={setInput}
        />
      </div>
    </form>
  );
}
