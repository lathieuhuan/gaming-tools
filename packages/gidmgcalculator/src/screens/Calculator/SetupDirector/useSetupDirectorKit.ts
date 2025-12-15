import { useEffect, useState } from "react";

import { MAX_CALC_SETUPS } from "@/constants";
import Array_ from "@/utils/Array";
import Object_ from "@/utils/Object";
import { MultiSetupChange, updateMultiSetups } from "@Store/calculator/actions";
import { useShallowCalcStore } from "@Store/calculator/calculator-store";
import { getCopyName } from "@Store/calculator/utils";

function getNewSetupName(setups: Array<{ name: string }>) {
  const existedIndexes = [1, 2, 3, 4];

  for (const { name } of setups) {
    const parts = name.split(" ");

    if (parts.length === 2 && parts[0] === "Setup" && !isNaN(+parts[1])) {
      const i = existedIndexes.indexOf(+parts[1]);

      if (i !== -1) {
        existedIndexes.splice(i, 1);
      }
    }
  }
  return "Setup " + existedIndexes[0];
}

export function useSetupDirectorKit() {
  const { setupManagers, comparedIds, standardId } = useShallowCalcStore((state) =>
    Object_.pickProps(state, ["setupManagers", "comparedIds", "standardId"])
  );

  const [tempSetups, setTempSetups] = useState<MultiSetupChange[]>(
    setupManagers.map((manager) => ({
      ...manager,
      status: "OLD",
      isCompared: comparedIds.includes(manager.ID),
    }))
  );
  const [tempStandardId, setTempStandardId] = useState(
    Array_.findById(tempSetups, standardId)?.ID || 0
  );
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
      const newSetupName = getCopyName(prev[index].name, displayedSetups) || "New setup";

      const newSetup: MultiSetupChange = {
        ...prev[index],
        ID: Date.now(),
        name: newSetupName,
        type: "original",
        originId: prev[index].ID,
        status: "DUPLICATE",
      };

      return [...prev, newSetup];
    });
  };

  const addNewSetup = () => {
    setTempSetups((prev) => {
      const newSetup: MultiSetupChange = {
        ID: Date.now(),
        name: getNewSetupName(prev),
        type: "original",
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

    updateMultiSetups(tempSetups, tempStandardId);
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
  };
}
