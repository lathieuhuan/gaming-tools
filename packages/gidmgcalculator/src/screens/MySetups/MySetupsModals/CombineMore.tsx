import { Array_ } from "ron-utils";

import type { IDbComplexSetup, IDbSetup } from "@/types";

import { useStoreSnapshot } from "@/systems/dynamic-store";
import { isDbSetup } from "@/logic/setup.logic";
import { useDispatch, useSelector } from "@Store/hooks";
import { addSetupToComplex, selectActiveSetupId, selectDbSetups } from "@Store/userdbSlice";
import { useCombineManager } from "./hooks/useCombineManager";

type CombineMoreProcessedResult = {
  dbSetups: (IDbSetup | IDbComplexSetup)[];
  setupOptions: IDbSetup[];
  remainCharacters: number[];
  targetSetup?: IDbComplexSetup;
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

type CombineMoreProps = {
  onClose: () => void;
};

export default function CombineMore({ onClose }: CombineMoreProps) {
  const dispatch = useDispatch();
  const setupID = useSelector(selectActiveSetupId);

  const { dbSetups, targetSetup, setupOptions, remainCharacters } =
    useCombineMoreProcessor(setupID);
  const { isError, pickedIDs, combineMenu, setIsError } = useCombineManager({
    options: setupOptions,
    limit: remainCharacters.length,
  });

  const tryCombine = () => {
    if (pickedIDs.length) {
      const existedCodes: number[] = [];

      for (const pickedID of pickedIDs) {
        const setup = Array_.findById(dbSetups, pickedID);

        if (setup && isDbSetup(setup)) {
          const { code } = setup.main;

          if (existedCodes.includes(code)) {
            setIsError(true);
            return;
          } else {
            existedCodes.push(code);
          }
        }
      }

      dispatch(addSetupToComplex({ complexID: setupID, pickedIDs }));
      onClose();
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    tryCombine();
  };

  return (
    <form id="setup-combine-more" className="h-full flex flex-col break-words" onSubmit={onSubmit}>
      <p className={"px-2 " + (isError ? "text-danger-2" : "text-light-hint")}>
        {isError ? (
          "These 2 Setups feature the same Character."
        ) : (
          <>
            Choose setups to be combined into "<b>{targetSetup?.name}</b>".
          </>
        )}
      </p>

      <div className="mt-2 px-2 grow custom-scrollbar">{combineMenu}</div>
    </form>
  );
}
