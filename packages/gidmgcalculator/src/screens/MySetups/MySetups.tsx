import { useEffect } from "react";
import { FaInfo } from "react-icons/fa";
import { clsx, Button, LoadingSpin, WarehouseLayout, useScreenWatcher } from "rond";

import type { UserComplexSetup, UserSetup } from "@Src/types";
import { useAppCharacter } from "@Src/hooks";
import { $AppCharacter } from "@Src/services";
import { Setup_, UserSetupItems, findById } from "@Src/utils";

import type { OpenModalFn } from "./MySetups.types";
import { useSetupItems } from "./hooks";
import { calculateChosenSetup } from "./MySetups.utils";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { chooseUserSetup, selectChosenSetupId, selectUserSetups } from "@Store/userdb-slice";

// Component
import { FinalResultView } from "@Src/components";
import { ChosenSetupModals } from "./ChosenSetupModals";
import { MySetupsModals } from "./MySetupsModals";
import { SetupTemplate } from "./SetupTemplate";

export default function MySetups() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const userSetups = useSelector(selectUserSetups);
  const chosenSetupID = useSelector(selectChosenSetupId);
  // const chosenSetupID = useSelector((state) => state.userdb.chosenSetupID);

  const chosenSetup = (() => {
    const setup = findById(userSetups, chosenSetupID);
    return setup && setup.type === "complex" ? (findById(userSetups, setup.shownID) as UserSetup) : setup;
  })();

  const { itemsBySetupID } = useSetupItems(userSetups);
  const { isLoading, error } = useAppCharacter(chosenSetup?.char.name);
  // const isLoading = false;
  // const error = null;

  useEffect(() => {
    document.getElementById(`setup-${chosenSetupID}`)?.scrollIntoView();
  }, [chosenSetupID]);

  const openModal: OpenModalFn = (type) => () => {
    dispatch(updateUI({ mySetupsModalType: type }));
  };

  const renderSetupLayout = (setup: UserSetup, items: UserSetupItems, complexSetup?: UserComplexSetup) => {
    return (
      <div key={setup.ID} id={`setup-${setup.ID}`} className="w-full p-1">
        <div
          className={clsx(
            "px-2 pt-3 pb-2 rounded-lg bg-surface-3",
            setup.ID === chosenSetupID ? "shadow-5px-1px shadow-active-color" : "shadow-common"
          )}
          onClick={() => dispatch(chooseUserSetup(setup.ID))}
        >
          <SetupTemplate setup={setup} {...items} complexSetup={complexSetup} openModal={openModal} />
        </div>
      </div>
    );
  };

  const renderedSetups: JSX.Element[] = [];

  for (const setup of userSetups) {
    if (Setup_.isUserSetup(setup)) {
      const items = itemsBySetupID[setup.ID];

      if (setup.type === "original" && items) {
        renderedSetups.push(renderSetupLayout(setup, items));
      }
      continue;
    }
    const actualSetup = userSetups.find((userSetup) => userSetup.ID === setup.shownID);

    if (actualSetup && Setup_.isUserSetup(actualSetup)) {
      const items = itemsBySetupID[actualSetup.ID];

      if (items) {
        renderedSetups.push(renderSetupLayout(actualSetup, items, setup));
      }
    }
  }

  const renderChosenSetup = () => {
    if (chosenSetup) {
      const { weapon, artifacts } = itemsBySetupID[chosenSetup.ID] || {};
      const result = calculateChosenSetup(chosenSetup, weapon, artifacts);

      return (
        <div className="h-full flex flex-col">
          <div>
            <p className="text-sm text-center truncate">{chosenSetup.name}</p>
          </div>
          <div className="mt-2 grow hide-scrollbar">
            {result?.finalResult && weapon && (
              <FinalResultView
                char={chosenSetup.char}
                appChar={$AppCharacter.get(chosenSetup.char.name)}
                weapon={weapon}
                party={chosenSetup.party}
                finalResult={result.finalResult}
              />
            )}
          </div>

          <ChosenSetupModals {...{ chosenSetup, weapon, artifacts, result }} />
        </div>
      );
    }
    return null;
  };

  return (
    <WarehouseLayout
      className="h-full"
      bodyStyle={{
        width: screenWatcher.isFromSize("xm") ? "auto" : undefined,
      }}
      actions={
        <div className="flex items-center space-x-4">
          <Button size="small" icon={<FaInfo />} onClick={openModal("TIPS")} />
          <Button onClick={openModal("FIRST_COMBINE")}>Combine</Button>
        </div>
      }
    >
      <div
        className={clsx(
          userSetups.length && "p-1 xm:pr-3",
          "shrink-0 flex flex-col items-start custom-scrollbar scroll-smooth space-y-3"
        )}
        style={{
          minWidth: screenWatcher.isFromSize("lg") ? "541px" : "19.5rem",
        }}
      >
        {renderedSetups.length ? (
          renderedSetups
        ) : (
          <p className="w-full py-4 text-hint-color text-lg text-center">No setups found</p>
        )}
      </div>

      <div className="shrink-0 px-4 pt-2 pb-4 rounded-lg bg-surface-3" style={{ width: "21.75rem" }}>
        {error ? (
          <p className="text-center text-danger-3">{error}</p>
        ) : isLoading ? (
          <div className="w-full h-full flex-center">
            <LoadingSpin size="large" />
          </div>
        ) : (
          renderChosenSetup()
        )}
      </div>

      <MySetupsModals combineMoreId={chosenSetupID} />
    </WarehouseLayout>
  );
}
