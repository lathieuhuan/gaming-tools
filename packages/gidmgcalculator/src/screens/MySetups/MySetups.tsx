import { useEffect, useMemo } from "react";
import { FaInfo } from "react-icons/fa";
import { Array_ } from "ron-utils";
import { Button, WarehouseLayout, clsx, useScreenWatcher } from "rond";

import type { SetupOverviewInfo } from "./types";

import { isDbSetup, restoreCalcSetup } from "@/logic/setup.logic";
import { parseDbArtifacts, parseDbWeapon } from "@/logic/userdb.logic";
import { useSetupImporter } from "@/lib/setup-importer";
import { useDispatch, useSelector } from "@Store/hooks";
import { MySetupsModalType, updateUI } from "@Store/ui";
import { selectActiveSetupId, viewDbSetup } from "@Store/userdbSlice";
import { createSetupForTeammate } from "./logic/createSetupForTeammate";
import { setupToOverviewInfo } from "./logic/setupToOverviewInfo";

// Component
import { WarehouseWrapper } from "../components/WarehouseWrapper";
import { MySetupsModals } from "./MySetupsModals";
import { SelectedResult } from "./SelectedResult";
import { SetupView } from "./SetupView";

function MySetups() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const setupImporter = useSetupImporter();
  const userdb = useSelector((state) => state.userdb);
  const selectedSetupId = useSelector(selectActiveSetupId);

  const { userWps: userWeapons, userArts: userArtifacts, userSetups } = userdb;

  useEffect(() => {
    document.getElementById(`setup-${selectedSetupId}`)?.scrollIntoView();
  }, [selectedSetupId]);

  const handleEditSetup = (info: SetupOverviewInfo) => {
    const { dbSetup } = info;
    const { ID, name, type, main } = dbSetup;
    const mainData = info.setup.main.data;
    const weapon = parseDbWeapon(main.weaponID, userWeapons, mainData.weaponType);
    const atfGear = parseDbArtifacts(main.artifactIDs, userArtifacts);

    setupImporter.import({
      ID,
      name,
      type,
      params: restoreCalcSetup(dbSetup, weapon, atfGear),
      source: "MY_SETUPS",
    });
  };

  const openModal = (type: MySetupsModalType) => () => {
    updateUI({ mySetupsModalType: type });
  };

  const handleCalculateTeammateSetup = (info: SetupOverviewInfo, teammateIndex: number) => {
    const setup = createSetupForTeammate(info, teammateIndex, userdb);

    setupImporter.import({
      type: "original",
      name: "New setup",
      params: setup,
      source: "MY_SETUPS",
    });
  };

  const overviewInfos = useMemo(() => {
    //
    return Array_.truthify(userSetups.map((setup) => setupToOverviewInfo(setup, userdb)));
    //
  }, [userSetups, userWeapons, userArtifacts]);

  const selectedSetup = Array_.findById(userSetups, selectedSetupId);
  const selectedDbSetupId = selectedSetup
    ? isDbSetup(selectedSetup)
      ? selectedSetup.ID
      : selectedSetup.shownID
    : undefined;
  const selectedInfo = overviewInfos.find((info) => info.setup.ID === selectedDbSetupId);

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
          "shrink-0 custom-scrollbar scroll-smooth"
        )}
        style={{
          minWidth: screenWatcher.isFromSize("lg") ? "541px" : "19.5rem",
        }}
      >
        <div className="flex flex-col items-start space-y-3 peer">
          {overviewInfos.map((info) => {
            const { setup, complexSetup } = info;
            const setupId = complexSetup?.ID || setup.ID;

            return (
              <div key={setupId} id={`setup-${setupId}`} className="w-full p-1">
                <div
                  className={clsx(
                    "px-2 pt-3 pb-2 rounded-lg bg-dark-3",
                    setupId === selectedSetupId
                      ? "shadow-hightlight-1 shadow-active"
                      : "shadow-common"
                  )}
                  onClick={() => dispatch(viewDbSetup(setupId))}
                >
                  <SetupView
                    {...info}
                    onEditSetup={() => handleEditSetup(info)}
                    onCalcTeammateSetup={(teammateIndex) =>
                      handleCalculateTeammateSetup(info, teammateIndex)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="py-4 text-light-hint text-lg text-center hidden peer-empty:block">
          No setups found
        </p>
      </div>

      <div className="shrink-0 px-4 pt-2 pb-4 rounded-lg bg-dark-3" style={{ width: "21.75rem" }}>
        {selectedInfo && (
          <SelectedResult setup={selectedInfo.setup} dbSetup={selectedInfo.dbSetup} />
        )}
      </div>

      <MySetupsModals />
    </WarehouseLayout>
  );
}

export function MySetupsWrapper() {
  return (
    <WarehouseWrapper>
      <MySetups />
    </WarehouseWrapper>
  );
}
