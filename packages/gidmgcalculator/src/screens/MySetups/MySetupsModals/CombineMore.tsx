import type { UserComplexSetup, UserSetup } from "@/types";

import { useStoreSnapshot } from "@/systems/dynamic-store";
import Array_ from "@/utils/Array";
import Setup_ from "@/utils/Setup";
import { useDispatch } from "@Store/hooks";
import { addSetupToComplex, selectUserSetups } from "@Store/userdb-slice";
import { useCombineManager } from "./hooks";

interface CombineMoreProcessedResult {
  userSetups: (UserSetup | UserComplexSetup)[];
  setupOptions: UserSetup[];
  remainCharacters: string[];
  targetSetup?: UserComplexSetup;
}

function useCombineMoreProcessor(setupID: number) {
  const userSetups = useStoreSnapshot(selectUserSetups);
  const result: CombineMoreProcessedResult = {
    userSetups,
    setupOptions: [],
    remainCharacters: [],
  };

  const targetSetup = Array_.findById(userSetups, setupID);
  if (!targetSetup || Setup_.isUserSetup(targetSetup)) {
    return result;
  }

  const displayedSetup = Array_.findById(userSetups, targetSetup.shownID);
  if (!displayedSetup || !Setup_.isUserSetup(displayedSetup)) {
    return result;
  }

  const allChars = displayedSetup.party.reduce(
    (result, teammate) => {
      if (teammate) {
        result.push(teammate.name);
      }
      return result;
    },
    [displayedSetup.char.name]
  );

  result.targetSetup = targetSetup;
  result.remainCharacters = allChars.filter((name) => !targetSetup.allIDs[name]);

  result.setupOptions = userSetups.filter((setup) => {
    return (
      setup.type === "original" &&
      setup.party.length === 3 &&
      setup.party.every((teammate) => teammate && allChars.includes(teammate.name)) &&
      result.remainCharacters.includes(setup.char.name)
    );
  }) as UserSetup[];

  return result;
}

interface CombineMoreProps {
  setupID: number;
  onClose: () => void;
}
export default function CombineMore({ setupID, onClose }: CombineMoreProps) {
  const dispatch = useDispatch();

  const { userSetups, targetSetup, setupOptions, remainCharacters } = useCombineMoreProcessor(setupID);
  const { isError, pickedIDs, combineMenu, setIsError } = useCombineManager({
    options: setupOptions,
    limit: remainCharacters.length,
  });

  const tryCombine = () => {
    if (pickedIDs.length) {
      const existedNames: string[] = [];

      for (const pickedID of pickedIDs) {
        const setup = Array_.findById(userSetups, pickedID);

        if (setup && Setup_.isUserSetup(setup)) {
          const { name } = setup.char;

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
      <p className={"px-2 " + (isError ? "text-danger-3" : "text-hint-color")}>
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
