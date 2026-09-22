import { ComponentProps, useState } from "react";
import { Array_ } from "ron-utils";
import { clsx, ExactOmit } from "rond";

import type { DbComplexSetup, DbSetup } from "@/types";

import { useStoreSnapshot } from "@/lib/dynamic-store";
import { isDbSetup } from "@/logic/setup.logic";
import { useDispatch, useSelector } from "@Store/hooks";
import { addSetupToComplex, selectActiveSetupId, selectDbSetups } from "@Store/userdbSlice";

import { SetupCombineMenu } from "./SetupCombineMenu";

type CombineMoreProcessedResult = {
  dbSetups: (DbSetup | DbComplexSetup)[];
  setupOptions: DbSetup[];
  remainCharacters: number[];
  targetSetup?: DbComplexSetup;
};

function useCombineMoreProcessor(setupID: number) {
  const dbSetups = useStoreSnapshot(selectDbSetups);
  const result: CombineMoreProcessedResult = {
    dbSetups,
    setupOptions: [],
    remainCharacters: [],
  };

  const targetSetup = Array_.findById(dbSetups, setupID);
  if (!targetSetup || isDbSetup(targetSetup)) {
    return result;
  }

  const displayedSetup = Array_.findById(dbSetups, targetSetup.shownID);
  if (!displayedSetup || !isDbSetup(displayedSetup)) {
    return result;
  }

  const allChars = [
    displayedSetup.main.code,
    ...displayedSetup.teammates.map((teammate) => teammate.code),
  ];

  result.targetSetup = targetSetup;
  result.remainCharacters = allChars.filter((code) => !targetSetup.allIDs[code]);

  result.setupOptions = dbSetups.filter(isDbSetup).filter((setup) => {
    return (
      setup.type === "original" &&
      setup.teammates.length === 3 &&
      setup.teammates.every((teammate) => teammate && allChars.includes(teammate.code)) &&
      result.remainCharacters.includes(setup.main.code)
    );
  });

  return result;
}

type SetupCombineMoreFormProps = ExactOmit<ComponentProps<"form">, "onSubmit"> & {
  onFinish?: () => void;
};

export function SetupCombineMoreForm({ className, onFinish, ...props }: SetupCombineMoreFormProps) {
  const dispatch = useDispatch();
  const setupID = useSelector(selectActiveSetupId);

  const [pickedIDs, setPickedIDs] = useState<number[]>([]);
  const [isError, setIsError] = useState(false);

  const { dbSetups, targetSetup, setupOptions, remainCharacters } =
    useCombineMoreProcessor(setupID);

  const handleChangePickedIDs = (ids: number[]) => {
    setPickedIDs(ids);
    setIsError(false);
  };

  const tryCombine = () => {
    if (pickedIDs.length === 0) {
      return;
    }

    const existedCodes: number[] = [];

    for (const pickedID of pickedIDs) {
      const setup = Array_.findById(dbSetups, pickedID);

      if (setup && isDbSetup(setup)) {
        const { code } = setup.main;

        if (existedCodes.includes(code)) {
          setIsError(true);
          return;
        }

        existedCodes.push(code);
      }
    }

    dispatch(addSetupToComplex({ complexID: setupID, pickedIDs }));
    onFinish?.();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
          <p className="text-danger-2">These 2 Setups feature the same Character.</p>
        ) : (
          <p className="text-light-hint">
            Choose setups to be combined into "<b>{targetSetup?.name}</b>".
          </p>
        )}
      </div>

      <SetupCombineMenu
        className="mt-2 px-2 grow custom-scrollbar"
        setups={setupOptions}
        pickedIds={pickedIDs}
        limit={remainCharacters.length}
        onChange={handleChangePickedIDs}
      />
    </form>
  );
}
