import type { IDbComplexSetup, IDbSetup } from "@/types";

import { useStoreSnapshot } from "@/systems/dynamic-store";
import Array_ from "@/utils/Array";
import { isDbSetup } from "@/utils/Setup";
import { useDispatch } from "@Store/hooks";
import { addSetupToComplex, selectUserSetups } from "@Store/userdb-slice";
import { useCombineManager } from "./hooks";

type CombineMoreProcessedResult = {
  dbSetups: (IDbSetup | IDbComplexSetup)[];
  setupOptions: IDbSetup[];
  remainCharacters: string[];
  targetSetup?: IDbComplexSetup;
};

function useCombineMoreProcessor(setupID: number) {
  const dbSetups = useStoreSnapshot(selectUserSetups);
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
    displayedSetup.main.name,
    ...displayedSetup.teammates.map((teammate) => teammate.name),
  ];

  result.targetSetup = targetSetup;
  result.remainCharacters = allChars.filter((name) => !targetSetup.allIDs[name]);

  result.setupOptions = dbSetups.filter(isDbSetup).filter((setup) => {
    return (
      setup.type === "original" &&
      setup.teammates.length === 3 &&
      setup.teammates.every((teammate) => teammate && allChars.includes(teammate.name)) &&
      result.remainCharacters.includes(setup.main.name)
    );
  });

  return result;
}

type CombineMoreProps = {
  setupID: number;
  onClose: () => void;
};

export default function CombineMore({ setupID, onClose }: CombineMoreProps) {
  const dispatch = useDispatch();

  const { dbSetups, targetSetup, setupOptions, remainCharacters } =
    useCombineMoreProcessor(setupID);
  const { isError, pickedIDs, combineMenu, setIsError } = useCombineManager({
    options: setupOptions,
    limit: remainCharacters.length,
  });

  const tryCombine = () => {
    if (pickedIDs.length) {
      const existedNames: string[] = [];

      for (const pickedID of pickedIDs) {
        const setup = Array_.findById(dbSetups, pickedID);

        if (setup && isDbSetup(setup)) {
          const { name } = setup.main;

          if (existedNames.includes(name)) {
            setIsError(true);
            return;
          } else {
            existedNames.push(name);
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
