import { useEffect } from "react";
import { FaInfo } from "react-icons/fa";
import { clsx, Button, LoadingSpin, WarehouseLayout, useScreenWatcher } from "rond";

import type { UserComplexSetup, UserSetup } from "@Src/types";
import { useAppCharacter } from "@Src/hooks";
import { Setup_, findById } from "@Src/utils";

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

  const chosenSetup = (() => {
    const setup = findById(userSetups, chosenSetupID);
    return setup && setup.type === "complex" ? (findById(userSetups, setup.shownID) as UserSetup) : setup;
  })();

  const { itemsBySetupID } = useSetupItems(userSetups);
  const { isLoading, error } = useAppCharacter(chosenSetup?.char.name);
  // const isLoading = true;
  // const error = null;

  useEffect(() => {
    document.getElementById(`setup-${chosenSetupID}`)?.scrollIntoView();
  }, [chosenSetupID]);

  const openModal: OpenModalFn = (type) => () => {
    dispatch(updateUI({ mySetupsModalType: type }));
  };

  const setupList = (() => {
    if (!userSetups.length) {
      return <p className="w-full py-4 text-light-800 text-lg text-center">No setups found</p>;
    }

    return userSetups.map((setup: UserSetup | UserComplexSetup, index: number) => {
      if (setup.type === "combined") return null;
      let key = 0;
      let setupDisplay: JSX.Element | null;

      if (setup.type === "complex") {
        const actualSetup = userSetups.find((userSetup) => userSetup.ID === setup.shownID);
        if (!actualSetup || !Setup_.isUserSetup(actualSetup)) return null;

        key = actualSetup.ID;
        setupDisplay = itemsBySetupID[actualSetup.ID] ? (
          <SetupTemplate
            ID={setup.ID}
            setupName={setup.name}
            setup={actualSetup}
            {...itemsBySetupID[actualSetup.ID]}
            allIDs={setup.allIDs}
            openModal={openModal}
          />
        ) : null;
      } else {
        key = setup.ID;
        setupDisplay = itemsBySetupID[setup.ID] ? (
          <SetupTemplate ID={setup.ID} setup={setup} {...itemsBySetupID[setup.ID]} openModal={openModal} />
        ) : null;
      }

      return setupDisplay ? (
        <div key={key} id={`setup-${setup.ID}`} className="w-full p-1">
          <div
            className={clsx(
              "px-2 pt-3 pb-2 rounded-lg bg-dark-500",
              setup.ID === chosenSetupID ? "shadow-5px-1px shadow-green-200" : "shadow-common"
            )}
            onClick={() => dispatch(chooseUserSetup(setup.ID))}
          >
            {setupDisplay}
          </div>
        </div>
      ) : null;
    });
  })();

  const chosenSetupInfo = (() => {
    if (chosenSetup) {
      if (error) {
        return <p className="text-center text-red-100">{error}</p>;
      }
      if (isLoading) {
        return (
          <div className="w-full h-full flex-center">
            <LoadingSpin size="large" />
          </div>
        );
      }

      const { weapon, artifacts } = itemsBySetupID[chosenSetup.ID] || {};

      const result = calculateChosenSetup(chosenSetup, weapon, artifacts);

      return (
        <div className="h-full flex flex-col">
          <div>
            <p className="text-sm text-center truncate">{chosenSetup.name}</p>
          </div>
          <div className="mt-2 grow hide-scrollbar">
            {result?.finalResult && (
              <FinalResultView char={chosenSetup.char} party={chosenSetup.party} finalResult={result.finalResult} />
            )}
          </div>

          <ChosenSetupModals {...{ chosenSetup, weapon, artifacts, result }} />
        </div>
      );
    }
    return null;
  })();

  return (
    <WarehouseLayout
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
          minWidth: screenWatcher.isFromSize("lg") ? "541px" : "",
        }}
      >
        {setupList}
      </div>

      <div className="shrink-0 px-4 pt-2 pb-4 rounded-lg bg-dark-500" style={{ width: "21.75rem" }}>
        {chosenSetupInfo}
      </div>

      <MySetupsModals combineMoreId={chosenSetupID} />
    </WarehouseLayout>
  );
}
