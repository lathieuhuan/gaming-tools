import { useEffect, useId, useMemo } from "react";
import { FaInfo } from "react-icons/fa";
import { Array_ } from "ron-utils";
import { Button, EmptyFallback, WarehouseLayout, clsx, useScreenWatcher } from "rond";

import type { SetupOverviewInfo } from "./types";

import { isDbSetup, restoreCalcSetup } from "@/logic/setup.logic";
import { parseDbArtifacts, parseDbWeapon } from "@/logic/userdb.logic";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectActiveSetupId, viewDbSetup } from "@Store/userdbSlice";
import { createSetupForTeammate } from "./logic/createSetupForTeammate";
import { overviewToCalcSetup } from "./logic/overviewToCalcSetup";
import { setupToOverviewInfo } from "./logic/setupToOverviewInfo";

// Component
import { FinalResultView } from "@/components/FinalResultView";
import { ModalAction } from "@/components/ModalAction";
import { sendToImportCenter } from "@Store/ui";
import { WarehouseWrapper } from "../components/WarehouseWrapper";
import { ActiveSetupModalProvider } from "./ActiveSetupModalProvider";
import { SetupCombineForm } from "./components/SetupCombineForm";
import { SetupView } from "./components/SetupView";
import { Tips } from "./components/Tips";

function MySetups() {
  const dispatch = useDispatch();
  const combineFormId = useId();
  const screenWatcher = useScreenWatcher();

  const userdb = useSelector((state) => state.userdb);
  const selectedSetupId = useSelector(selectActiveSetupId);

  const { userWps: userWeapons, userArts: userArtifacts, userSetups } = userdb;

  useEffect(() => {
    document.getElementById(`setup-${selectedSetupId}`)?.scrollIntoView({ block: "center" });
  }, [selectedSetupId]);

  const overviewInfos = useMemo(() => {
    //
    return Array_.mapFilter(
      userSetups,
      (setup) => setupToOverviewInfo(setup, userdb),
      (info) => info !== null,
    );
  }, [userSetups, userWeapons, userArtifacts]);

  const { calcSetup, selectedInfo } = useMemo(() => {
    const selectedSetup = Array_.findById(userSetups, selectedSetupId);

    if (selectedSetup === undefined) {
      return {
        calcSetup: undefined,
        selectedInfo: undefined,
      };
    }

    const selectedDbSetupId = isDbSetup(selectedSetup) ? selectedSetup.ID : selectedSetup.shownID;
    const selectedInfo = overviewInfos.find((info) => info.setup.ID === selectedDbSetupId);

    if (selectedInfo === undefined) {
      return {
        calcSetup: undefined,
        selectedInfo: undefined,
      };
    }

    return {
      calcSetup: overviewToCalcSetup(selectedInfo),
      selectedInfo,
    };
  }, [userSetups, overviewInfos, selectedSetupId]);

  const handleEditSetup = (info: SetupOverviewInfo) => {
    const { dbSetup } = info;
    const { main } = dbSetup;
    const mainData = info.setup.main.data;
    const weapon = parseDbWeapon(main.weaponID, userWeapons, mainData.weaponType);
    const atfGear = parseDbArtifacts(main.artifactIDs, userArtifacts);

    const setup = restoreCalcSetup(dbSetup, weapon, atfGear);

    sendToImportCenter(setup, {
      id: dbSetup.ID,
      name: dbSetup.name,
      type: dbSetup.type,
      source: "MY_SETUPS",
    });
  };

  const handleCalcTeammateSetup = (info: SetupOverviewInfo, teammateIndex: number) => {
    const setup = createSetupForTeammate(info, teammateIndex, userdb);

    sendToImportCenter(setup, {
      source: "MY_SETUPS",
    });
  };

  return (
    <WarehouseLayout
      className="h-full"
      bodyStyle={{
        width: screenWatcher.isFromSize("xm") ? "auto" : undefined,
      }}
      actions={
        <div className="flex items-center space-x-4">
          <ModalAction
            title="Tips"
            preset="large"
            bodyCls="grow custom-scrollbar"
            content={<Tips />}
          >
            <Button size="small" icon={<FaInfo />} />
          </ModalAction>

          <ModalAction
            title="Combine setups"
            className="min-w-75 h-[90vh] max-h-256 bg-dark-2"
            bodyCls="grow hide-scrollbar"
            withActions
            formId={combineFormId}
            content={(_, setOpen) => (
              <SetupCombineForm id={combineFormId} onFinish={() => setOpen(false)} />
            )}
          >
            <Button>Combine</Button>
          </ModalAction>
        </div>
      }
    >
      <ActiveSetupModalProvider setupName={selectedInfo?.setup.name} calcSetup={calcSetup}>
        <EmptyFallback
          containerCls={clsx(
            "shrink-0 custom-scrollbar scroll-smooth",
            userSetups.length && "p-1 xm:pr-3",
            screenWatcher.isFromSize("lg") ? "min-w-135" : "min-w-78",
          )}
          className="flex flex-col items-start space-y-3 peer"
          messageCls="text-lg"
          message="No setups found"
        >
          {overviewInfos.map((info) => {
            const { setup, complexSetup } = info;
            const setupId = complexSetup?.ID || setup.ID;

            return (
              <div
                id={`setup-${setupId}`}
                key={setupId}
                className={clsx(
                  "px-2 pt-3 pb-2 rounded-lg bg-dark-3",
                  setupId === selectedSetupId
                    ? "shadow-hightlight-1 shadow-active"
                    : "shadow-common",
                )}
                onClick={() => dispatch(viewDbSetup(setupId))}
              >
                <SetupView
                  {...info}
                  onEditSetup={() => handleEditSetup(info)}
                  onCalcTeammateSetup={(teammateIndex) =>
                    handleCalcTeammateSetup(info, teammateIndex)
                  }
                />
              </div>
            );
          })}
        </EmptyFallback>
      </ActiveSetupModalProvider>

      <div className="w-87 h-full px-4 pt-2 pb-4 rounded-lg bg-dark-3 flex flex-col shrink-0">
        <p className="text-sm text-right truncate shrink-0">{selectedInfo?.setup.name}</p>

        <div className="mt-2 grow hide-scrollbar">
          {calcSetup && (
            <FinalResultView
              character={calcSetup.main}
              calcResult={calcSetup.result}
              extraKeys={calcSetup.calcItems.map((item) => item.name)}
            />
          )}
        </div>
      </div>
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
