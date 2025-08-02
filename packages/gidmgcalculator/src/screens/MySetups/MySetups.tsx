import { useEffect, useMemo } from "react";
import { FaInfo } from "react-icons/fa";
import { clsx, Button, LoadingSpin, WarehouseLayout, useScreenWatcher } from "rond";
import { CalcTeamData } from "@Calculation";

import type { UserArtifacts, UserComplexSetup, UserSetup, UserWeapon } from "@Src/types";
import { useAppCharacter } from "@Src/hooks";
import Setup_ from "@Src/utils/setup-utils";
import Array_ from "@Src/utils/array-utils";

import type { OpenModalFn } from "./MySetups.types";
import { calculateChosenSetup } from "./MySetups.utils";
import { useAppCharactersByName } from "./hooks/useAppCharactersByName";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import {
  chooseUserSetup,
  selectChosenSetupId,
  selectUserArtifacts,
  selectUserSetups,
  selectUserWeapons,
} from "@Store/userdb-slice";

// Component
import { FinalResultView } from "@Src/components";
import { ChosenSetupModals } from "./ChosenSetupModals";
import { MySetupsModals } from "./MySetupsModals";
import { SetupTemplate } from "./SetupTemplate";

type UserSetupItems = {
  weapon?: UserWeapon;
  artifacts: UserArtifacts;
};

type RenderedSetupConfig = {
  setup: UserSetup;
  items?: UserSetupItems;
  complex?: UserComplexSetup;
};

function getUserSetupItems(setup: UserSetup, userWeapons: UserWeapon[], userArtifacts: UserArtifacts): UserSetupItems {
  return {
    weapon: Array_.findById(userWeapons, setup.weaponID),
    artifacts: setup.artifactIDs.map((ID) => Array_.findById(userArtifacts, ID) || null),
  };
}

export default function MySetups() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const userWeapons = useSelector(selectUserWeapons);
  const userArtifacts = useSelector(selectUserArtifacts);
  const userSetups = useSelector(selectUserSetups);
  const chosenSetupID = useSelector(selectChosenSetupId);

  const appCharactersByName = useAppCharactersByName();

  const chosenSetup = (() => {
    const setup = Array_.findById(userSetups, chosenSetupID);
    return setup && setup.type === "complex" ? (Array_.findById(userSetups, setup.shownID) as UserSetup) : setup;
  })();

  const { isLoading, error } = useAppCharacter(chosenSetup?.char.name);
  // const isLoading = false;
  // const error = null;

  useEffect(() => {
    document.getElementById(`setup-${chosenSetupID}`)?.scrollIntoView();
  }, [chosenSetupID]);

  const openModal: OpenModalFn = (type) => () => {
    dispatch(updateUI({ mySetupsModalType: type }));
  };

  const itemsBySetupId = useMemo(() => {
    const result: Record<string, UserSetupItems> = {};

    for (const setup of userSetups) {
      if (Setup_.isUserSetup(setup)) {
        result[setup.ID] = getUserSetupItems(setup, userWeapons, userArtifacts);
      }
    }
    return result;
  }, []);

  const renderedSetupConfigs: RenderedSetupConfig[] = [];

  for (const setup of userSetups) {
    if (!Setup_.isUserSetup(setup)) {
      const actualSetup = userSetups.find((userSetup) => userSetup.ID === setup.shownID);

      if (actualSetup && Setup_.isUserSetup(actualSetup)) {
        renderedSetupConfigs.push({
          setup: actualSetup,
          items: itemsBySetupId[actualSetup.ID],
          complex: setup,
        });
      }
      continue;
    }
    if (setup.type === "original") {
      renderedSetupConfigs.push({
        setup,
        items: itemsBySetupId[setup.ID],
      });
    }
  }

  const renderChosenSetup = () => {
    if (chosenSetup) {
      const { weapon, artifacts } = itemsBySetupId[chosenSetup.ID] || {};
      const result = calculateChosenSetup(chosenSetup, weapon, artifacts);

      return (
        <div className="h-full flex flex-col">
          <div>
            <p className="text-sm text-center truncate">{chosenSetup.name}</p>
          </div>
          <div className="mt-2 grow hide-scrollbar">
            {result?.finalResult && weapon && (
              <FinalResultView weapon={weapon} teamData={result.teamData} finalResult={result.finalResult} />
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
        {renderedSetupConfigs.length ? (
          renderedSetupConfigs.map((config) => {
            const { setup, complex } = config;
            const { weapon, artifacts } = config.items || {};
            const setupId = complex?.ID || setup.ID;

            appCharactersByName.register(setup.char.name);
            setup.party.forEach((teammate) => teammate && appCharactersByName.register(teammate.name));

            const teamData = new CalcTeamData(setup.char, setup.party, appCharactersByName.data);

            return (
              <div key={setupId} id={`setup-${setupId}`} className="w-full p-1">
                <div
                  className={clsx(
                    "px-2 pt-3 pb-2 rounded-lg bg-surface-3",
                    setupId === chosenSetupID ? "shadow-5px-1px shadow-active-color" : "shadow-common"
                  )}
                  onClick={() => dispatch(chooseUserSetup(setupId))}
                >
                  {weapon ? (
                    <SetupTemplate
                      setup={setup}
                      teamData={teamData}
                      weapon={weapon}
                      artifacts={artifacts}
                      complexSetup={config.complex}
                      openModal={openModal}
                    />
                  ) : (
                    <div className="py-4 text-center">Error. Cannot find the character's weapon</div>
                  )}
                </div>
              </div>
            );
          })
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
