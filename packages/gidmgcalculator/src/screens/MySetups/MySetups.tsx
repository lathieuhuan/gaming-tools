import { useEffect, useMemo } from "react";
import { FaInfo } from "react-icons/fa";
import { Button, LoadingPlate, WarehouseLayout, clsx, useScreenWatcher } from "rond";

import type { OpenModalFn, SetupOverviewInfo } from "./types";

import { useTravelerKey } from "@/hooks";
import { useSetupImporter } from "@/systems/setup-importer";
import Array_ from "@/utils/Array";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectAppReady, updateUI } from "@Store/ui-slice";
import { chooseUserSetup, selectChosenSetupId } from "@Store/userdb-slice";
import { toOverviewInfo, renderInfoToImportInfo } from "./utils";

// Component
import { MySetupsModals } from "./MySetupsModals";
import { SetupView } from "./SetupView";
import { SelectedResult } from "./SelectedResult";

function MySetups() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const setupImporter = useSetupImporter();
  const userdb = useSelector((state) => state.userdb);
  const selectedSetupId = useSelector(selectChosenSetupId);

  const { userWps: userWeapons, userArts: userArtifacts, userSetups } = userdb;

  useEffect(() => {
    document.getElementById(`setup-${selectedSetupId}`)?.scrollIntoView();
  }, [selectedSetupId]);

  const openModal: OpenModalFn = (type) => () => {
    dispatch(updateUI({ mySetupsModalType: type }));
  };

  const handleEditSetup = (setup: SetupOverviewInfo["setup"]) => {
    // const { ID, name, type, target } = setup;
    // setupImporter.import({
    //   ID,
    //   name,
    //   type,
    //   calcSetup: Setup_.userSetupToCalcSetup(setup, weapon, artifacts, true),
    //   target,
    // });
  };

  const handleCalculateTeammateSetup = (info: SetupOverviewInfo, teammateIndex: number) => {
    // const importInfo = renderInfoToImportInfo(info, teammateIndex, userdb);
    // if (importInfo) {
    //   setupImporter.import(importInfo);
    // }
  };

  const overviewInfos = useMemo(() => {
    //
    return Array_.truthify(userSetups.map((setup) => toOverviewInfo(setup, userdb)));
    //
  }, [userSetups, userWeapons, userArtifacts]);

  const selectedInfo = overviewInfos.find((info) => info.setup.ID === selectedSetupId);

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
        {/* TODO improve UI */}
        {overviewInfos.length ? (
          overviewInfos.map((info) => {
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
                  onClick={() => dispatch(chooseUserSetup(setupId))}
                >
                  <SetupView
                    {...info}
                    onEditSetup={() => handleEditSetup(setup)}
                    onCalcTeammateSetup={(teammateIndex) =>
                      handleCalculateTeammateSetup(info, teammateIndex)
                    }
                    openModal={openModal}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="w-full py-4 text-light-hint text-lg text-center">No setups found</p>
        )}
      </div>

      <div className="shrink-0 px-4 pt-2 pb-4 rounded-lg bg-dark-3" style={{ width: "21.75rem" }}>
        {selectedInfo && (
          <SelectedResult setup={selectedInfo.setup} dbSetup={selectedInfo.dbSetup} />
        )}
      </div>

      <MySetupsModals combineMoreId={selectedSetupId} />
    </WarehouseLayout>
  );
}

export function MySetupsWrapper() {
  const appReady = useSelector(selectAppReady);
  const travelerKey = useTravelerKey();

  if (!appReady) {
    return (
      <WarehouseLayout className="h-full relative">
        <div className="absolute inset-0 flex-center">
          <LoadingPlate />
        </div>
      </WarehouseLayout>
    );
  }

  return <MySetups key={travelerKey} />;
}
