import { ComponentProps, FormEvent, useState } from "react";
import { Array_ } from "ron-utils";
import { clsx, ExactOmit, Input } from "rond";

import { useStoreSnapshot } from "@/lib/dynamic-store";
import { isDbSetup } from "@/logic/setup.logic";
import { useDispatch } from "@Store/hooks";
import { combineSetups, selectDbSetups } from "@Store/userdbSlice";

import { SetupCombineMenu } from "./SetupCombineMenu";

type SetupCombineFormProps = ExactOmit<ComponentProps<"form">, "onSubmit"> & {
  onFinish?: () => void;
};

export function SetupCombineForm({ className, onFinish, ...props }: SetupCombineFormProps) {
  const dispatch = useDispatch();
  const dbSetups = useStoreSnapshot(selectDbSetups);

  const [pickedIDs, setPickedIDs] = useState<number[]>([]);
  const [input, setInput] = useState("Team Setup");
  const [isError, setIsError] = useState(false);

  const setupOptions = dbSetups.filter(isDbSetup).filter((setup) => {
    return setup.type === "original" && setup.teammates.length === 3;
  });

  const handleChangePickedIDs = (ids: number[]) => {
    setPickedIDs(ids);
    setIsError(false);
  };

  const tryCombine = () => {
    if (pickedIDs.length < 2) {
      return;
    }
    if (!input) {
      setIsError(true);
      return;
    }

    const mains: number[] = [];
    const all: number[] = [];

    for (const id of pickedIDs) {
      const { main, teammates } = Array_.findById(setupOptions, id)!;

      if (mains.includes(main.code)) {
        setIsError(true);
        return;
      }

      mains.push(main.code);

      if (!all.includes(main.code)) {
        if (all.length === 4) {
          setIsError(true);
          return;
        }

        all.push(main.code);
      }

      for (const teammate of teammates) {
        if (!all.includes(teammate.code)) {
          if (all.length === 4) {
            setIsError(true);
            return;
          }

          all.push(teammate.code);
        }
      }
    }

    dispatch(combineSetups({ pickedIDs, name: input }));
    onFinish?.();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    tryCombine();
  };

  return (
    <form
      className={clsx("h-full flex flex-col break-words", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="px-2">
        {isError ? (
          <p className="text-danger-2">You cannot combine these setups.</p>
        ) : (
          <p className="text-light-hint">Choose at least 2 setups with the same party members.</p>
        )}
      </div>

      <SetupCombineMenu
        className="mt-2 px-2 grow custom-scrollbar"
        setups={setupOptions}
        pickedIds={pickedIDs}
        limit={4}
        onChange={handleChangePickedIDs}
      />

      <div className="mt-4">
        <Input
          className="w-full text-center font-semibold"
          size="medium"
          value={input}
          maxLength={32}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              tryCombine();
            }
          }}
          onChange={setInput}
        />
      </div>
    </form>
  );
}
