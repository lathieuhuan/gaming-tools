import { useEffect, useState } from "react";

import { MAX_CALC_SETUPS } from "@Src/constants";
import { Setup_, findById } from "@Src/utils";
import { useDispatch, useSelector } from "@Store/hooks";
import {
  NewSetupManageInfo,
  selectComparedIds,
  selectSetupManageInfos,
  selectStandardId,
  updateSetups,
} from "@Store/calculator-slice";

export function useSetupDirectorKit() {
  const dispatch = useDispatch();
  const setupManageInfos = useSelector(selectSetupManageInfos);
  const comparedIds = useSelector(selectComparedIds);
  const standardId = useSelector(selectStandardId);

  const [tempSetups, setTempSetups] = useState<NewSetupManageInfo[]>(
    setupManageInfos.map((manageInfos) => ({
      ...manageInfos,
      status: "OLD",
      isCompared: comparedIds.includes(manageInfos.ID),
    }))
  );
  const [tempStandardId, setTempStandardId] = useState(findById(tempSetups, standardId)?.ID || 0);
  const [errorCode, setErrorCode] = useState<"NO_SETUPS" | "">("");

  const displayedSetups = tempSetups.filter((tempSetup) => tempSetup.status !== "REMOVED");
  const comparedSetups = displayedSetups.filter((tempSetup) => tempSetup.isCompared);
  const canAddMoreSetup = displayedSetups.length < MAX_CALC_SETUPS;

  useEffect(() => {
    if (comparedSetups.length === 0 && tempStandardId !== 0) {
      setTempStandardId(0);
    } else if (
      comparedSetups.length === 1 ||
      comparedSetups.every((comparedSetup) => comparedSetup.ID !== tempStandardId)
    ) {
      setTempStandardId(comparedSetups[0]?.ID || 0);
    }
  }, [comparedSetups.length, tempStandardId]);

  const changeSetupName = (index: number) => (newName: string) => {
    setTempSetups((prev) => {
      const newTempSetups = [...prev];
      newTempSetups[index].name = newName;
      return newTempSetups;
    });

    if (errorCode) {
      setErrorCode("");
    }
  };

  const removeSetup = (index: number) => () => {
    if (tempSetups[index] && tempSetups[index].status === "OLD") {
      setTempSetups((prev) => {
        const newTempSetups = [...prev];
        newTempSetups[index].status = "REMOVED";
        newTempSetups[index].isCompared = false;
        return newTempSetups;
      });
    } else {
      setTempSetups((prev) => {
        const newTempSetups = [...prev];
        newTempSetups.splice(index, 1);
        return newTempSetups;
      });
    }
  };

  const copySetup = (index: number) => () => {
    setTempSetups((prev) => {
      const newSetupName = Setup_.getCopyName(
        prev[index].name,
        displayedSetups.map(({ name }) => name)
      );

      const newSetup: NewSetupManageInfo = {
        ...prev[index],
        ID: Date.now(),
        name: newSetupName || "New setup",
        type: "original",
        originId: prev[index].ID,
        status: "DUPLICATE",
      };

      return [...prev, newSetup];
    });
  };

  const addNewSetup = () => {
    setTempSetups((prev) => {
      const newSetup: NewSetupManageInfo = {
        ...Setup_.getManageInfo({ name: Setup_.getNewSetupName(prev) }),
        status: "NEW",
        isCompared: false,
      };
      return [...prev, newSetup];
    });

    setErrorCode("");
  };

  const toggleSetupCompared = (index: number) => () => {
    setTempSetups((prevTempSetups) => {
      const newTempSetups = [...prevTempSetups];
      newTempSetups[index].isCompared = !newTempSetups[index].isCompared;
      return newTempSetups;
    });
  };

  const selectStandardSetup = (index: number) => () => {
    setTempStandardId(tempSetups[index].ID);
  };

  const tryApplyNewSettings = (onSuccess?: () => void) => {
    if (!tempSetups.filter((tempSetup) => tempSetup.status !== "REMOVED").length) {
      setErrorCode("NO_SETUPS");
      return;
    }

    dispatch(
      updateSetups({
        newSetupManageInfos: tempSetups,
        newStandardId: tempStandardId,
      })
    );
    onSuccess?.();
  };

  return {
    displayedSetups,
    comparedSetups,
    canAddMoreSetup,
    tempStandardId,
    control: {
      tryApplyNewSettings,
      changeSetupName,
      addNewSetup,
      removeSetup,
      copySetup,
      toggleSetupCompared,
      selectStandardSetup,
    },
    dispatch,
  };
}
