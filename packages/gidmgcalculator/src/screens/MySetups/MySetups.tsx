import { CalcTeamData, calculateSetup } from "@Calculation";
import { useEffect, useMemo } from "react";
import { FaInfo } from "react-icons/fa";
import { Button, LoadingSpin, WarehouseLayout, clsx, useScreenWatcher } from "rond";

import type { UserArtifacts, UserSetup, UserWeapon } from "@/types";
import type { OpenModalFn, SetupRenderInfo } from "./types";

import { useSetupImporter } from "@/systems/setup-importer";
import Array_ from "@/utils/array-utils";
import Setup_ from "@/utils/setup-utils";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { chooseUserSetup, selectChosenSetupId } from "@Store/userdb-slice";
import { useAppCharactersByName } from "./hooks/useAppCharactersByName";
import { parseSetup, renderInfoToImportInfo } from "./utils";

// Component
import { FinalResultView } from "@/components";
import { MySetupsModals } from "./MySetupsModals";
import { SetupModals } from "./SetupModals";
import { SetupView } from "./SetupView";

export default function MySetups() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const setupImporter = useSetupImporter();
  const userdb = useSelector((state) => state.userdb);
  const selectedSetupID = useSelector(selectChosenSetupId);

  const appCharactersByName = useAppCharactersByName();

  const { userWps: userWeapons, userArts: userArtifacts, userSetups } = userdb;

  useEffect(() => {
    document.getElementById(`setup-${selectedSetupID}`)?.scrollIntoView();
  }, [selectedSetupID]);

  const openModal: OpenModalFn = (type) => () => {
    dispatch(updateUI({ mySetupsModalType: type }));
  };

  const handleEditSetup = (setup: UserSetup, weapon: UserWeapon, artifacts: UserArtifacts) => {
    const { ID, name, type, target } = setup;

    setupImporter.import({
      ID,
      name,
      type,
      calcSetup: Setup_.userSetupToCalcSetup(setup, weapon, artifacts, true),
      target,
    });
  };

  const handleCalculateTeammateSetup = (info: SetupRenderInfo, teammateIndex: number) => {
    const importInfo = renderInfoToImportInfo(info, teammateIndex, userdb);

    if (importInfo) {
      setupImporter.import(importInfo);
    }
  };

  const setupRenderInfos = useMemo(() => {
    const infos: SetupRenderInfo[] = [];

    for (const setup of userSetups) {
      const parsedResult = parseSetup(setup, userSetups);

      if (parsedResult) {
        const { setup, complexSetup } = parsedResult;

        const info: SetupRenderInfo = {
          setup,
          complexSetup,
          weapon: Array_.findById(userWeapons, setup.weaponID),
          artifacts: setup.artifactIDs.map((ID) => Array_.findById(userArtifacts, ID) || null),
        };

        infos.push(info);
      }
    }

    return infos;
  }, [userSetups, userWeapons, userArtifacts]);

  // const { isLoading, error } = useAppCharacter(chosenSetup?.char.name);
  const isLoading = false;
  const error = null;

  const renderChosenSetup = () => {
    const selectedInfo = setupRenderInfos.find(
      (info) => info.setup.ID === selectedSetupID || info.complexSetup?.ID === selectedSetupID
    );

    if (selectedInfo && selectedInfo.weapon) {
      const { weapon, artifacts } = selectedInfo;
      const { name, char, target, ...rest } = selectedInfo.setup;
      const result = calculateSetup({ char, weapon, artifacts, ...rest }, target);

      return (
        <div className="h-full flex flex-col">
          <div>
            <p className="text-sm text-center truncate">{name}</p>
          </div>
          <div className="mt-2 grow hide-scrollbar">
            {result?.finalResult && weapon && (
              <FinalResultView weapon={weapon} teamData={result.teamData} finalResult={result.finalResult} />
            )}
          </div>

          <SetupModals setup={selectedInfo.setup} {...{ weapon, artifacts, result }} />
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
        {setupRenderInfos.length ? (
          setupRenderInfos.map((info) => {
            const { setup, complexSetup, weapon, artifacts } = info;
            const setupId = complexSetup?.ID || setup.ID;

            appCharactersByName.register(setup.char.name);
            setup.party.forEach((teammate) => teammate && appCharactersByName.register(teammate.name));

            const teamData = new CalcTeamData(setup.char, setup.party, appCharactersByName.data);

            return (
              <div key={setupId} id={`setup-${setupId}`} className="w-full p-1">
                <div
                  className={clsx(
                    "px-2 pt-3 pb-2 rounded-lg bg-surface-3",
                    setupId === selectedSetupID ? "shadow-5px-1px shadow-active-color" : "shadow-common"
                  )}
                  onClick={() => dispatch(chooseUserSetup(setupId))}
                >
                  {weapon ? (
                    <SetupView
                      setup={setup}
                      teamData={teamData}
                      weapon={weapon}
                      artifacts={artifacts}
                      complexSetup={complexSetup}
                      onEditSetup={() => handleEditSetup(setup, weapon, artifacts || [])}
                      onCalcTeammateSetup={(teammateIndex) => handleCalculateTeammateSetup(info, teammateIndex)}
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

      <MySetupsModals combineMoreId={selectedSetupID} />
    </WarehouseLayout>
  );
}
