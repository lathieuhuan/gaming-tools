import { useEffect, useMemo, useRef, useState } from "react";
import { FaCaretRight, FaCalculator, FaListUl, FaTimes } from "react-icons/fa";
import { Button, ButtonGroup, clsx } from "rond";
import { ARTIFACT_TYPES, ArtifactType } from "@Backend";

import type { ArtifactManager } from "../../controllers/artifact-manager";

import { GenshinImage } from "@Src/components";
import { useOptimizerState } from "@Src/screens/Calculator/ContextProvider";
import { formatNumber } from "@Src/utils";
import Entity_ from "@Src/utils/entity-utils";

interface LauncherProps {
  manager: ArtifactManager;
  launchedOnce?: boolean;
  onRequestLastResult: () => void;
  onRequestLaunch: () => void;
  onRequestCancel: () => void;
}
export function Launcher({
  manager,
  launchedOnce,
  onRequestLastResult,
  onRequestLaunch,
  onRequestCancel,
}: LauncherProps) {
  const { status, optimizer } = useOptimizerState();
  const [process, setProcess] = useState({
    percent: 0,
    time: 0,
  });
  const [waitingCancel, setWaitingCancel] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    optimizer.onProcess = (info) => {
      setProcess({
        percent: Math.min(info.percent, 100),
        time: Math.round(info.time / 100) / 10,
      });
    };

    return () => {
      mounted.current = false;
    };
  }, []);

  const count = useMemo(() => {
    const each = {} as Record<ArtifactType, number>;

    for (const type of ARTIFACT_TYPES) {
      each[type] = manager.sumary[type].length;
    }
    return {
      ...each,
      all: each.flower + each.plume + each.sands + each.goblet + each.circlet,
      maxCalcs: manager.calcCount,
    };
  }, []);

  const renderArtifactCount = (type: ArtifactType) => {
    return (
      <div key={type} className="px-2 py-1 rounded bg-surface-3 flex-center">
        <GenshinImage
          className="w-7 h-7 shrink-0"
          src={Entity_.artifactIconOf(type)}
          imgType="artifact"
          fallbackCls="p-1"
        />
        <span className="ml-1 text-lg font-medium">{count[type]}</span>
      </div>
    );
  };

  const onClickCancel = () => {
    if (waitingCancel) {
      return onRequestCancel();
    }

    setWaitingCancel(true);

    setTimeout(() => {
      if (mounted.current) {
        setWaitingCancel(false);
      }
    }, 5000);
  };

  return (
    <div className="pt-2 space-y-4">
      <div>
        <p>
          • Total selected Artifacts: <span className="font-semibold text-lg text-primary-1">{count.all}</span>
        </p>

        <div className="mt-1 py-1 space-y-2">
          <div className="flex flex-wrap justify-center gap-2">{ARTIFACT_TYPES.map(renderArtifactCount)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <span>•</span>
        <div>
          <p>Maximum possible calculations:</p>
          <p className="font-bold text-lg text-primary-1">{formatNumber(count.maxCalcs.value)}</p>

          {count.maxCalcs.isExceededLimit ? (
            <p className="font-semibold text-danger-2 text-base">
              This exceeds the limit of {formatNumber(manager.LIMIT_CALC_COUNT)} calculations. Please select less
              Artifacts.
            </p>
          ) : null}
        </div>
      </div>

      <div className="w-full h-px mx-auto bg-surface-border" />

      {status.loading ? (
        <div className="px-4">
          <p className="text-lg text-center font-medium">Calculating...</p>

          <div className="w-full h-3 mt-4 bg-surface-1 shadow-surface-3 shadow-3px-2px rounded-md">
            <div
              className={clsx(
                "h-full bg-active-color rounded-l-md shadow-active-color transition-size duration-150 relative",
                process.percent && "shadow-5px-1px",
                process.percent === 100 && "rounded-r-md"
              )}
              style={{ width: `${process.percent}%` }}
            >
              {process.time ? (
                <span className="mt-2 absolute left-full top-full -translate-x-1/2 text-active-color font-semibold">
                  {process.time}s
                </span>
              ) : null}
            </div>
          </div>

          <div className="h-6" />

          <div className="mt-4 flex justify-end items-center gap-1">
            {waitingCancel && (
              <>
                <span className="text-sm">Tap again to cancel the process</span>
                <FaCaretRight />
              </>
            )}
            <Button
              variant={waitingCancel ? "danger" : "default"}
              icon={<FaTimes className="text-base" />}
              iconPosition="end"
              onClick={onClickCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <ButtonGroup
          buttons={[
            {
              children: "Last Result",
              className: !launchedOnce && "hidden",
              icon: <FaListUl className="text-base" />,
              onClick: onRequestLastResult,
            },
            {
              children: launchedOnce ? "Recalculate" : "Calculate",
              variant: "primary",
              icon: <FaCalculator className="text-base" />,
              disabled: count.maxCalcs.isExceededLimit,
              onClick: onRequestLaunch,
            },
          ]}
        />
      )}
    </div>
  );
}
