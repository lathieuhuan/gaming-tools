import { BiDetail } from "react-icons/bi";
import { FaSkull } from "react-icons/fa";
import { FaSun } from "react-icons/fa6";
import { clsx, useScreenWatcher } from "rond";

import { useOptimizeSystem } from "@Src/features";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectTargetConfig, updateUI } from "@Store/ui-slice";

export function QuickButtons() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const isTabLayout = useSelector((state) => state.ui.isTabLayout);
  const atScreen = useSelector((state) => state.ui.atScreen);
  const trackerState = useSelector((state) => state.ui.trackerState);
  const targetConfig = useSelector(selectTargetConfig);
  const { state, contact } = useOptimizeSystem();

  if (atScreen !== "CALCULATOR") {
    return null;
  }
  const isVisibleOnMobileTab = !screenWatcher.isFromSize("sm") && isTabLayout;

  const onClickTargetButton = () => {
    dispatch(updateUI({ targetConfig: { active: true, overviewed: false } }));
  };

  const onClickTrackerButton = () => {
    dispatch(updateUI({ trackerState: "open" }));
  };

  return (
    <div className="flex divide-x divide-surface-border">
      {isVisibleOnMobileTab && !targetConfig.overviewed ? (
        <button className="w-8 h-8 flex-center bg-surface-3 glow-on-hover" onClick={onClickTargetButton}>
          <FaSkull />
        </button>
      ) : null}

      {trackerState === "hidden" ? (
        <button className="w-8 h-8 flex-center bg-surface-3 glow-on-hover" onClick={onClickTrackerButton}>
          <BiDetail className="text-xl" />
        </button>
      ) : null}

      {isVisibleOnMobileTab && state.pendingResult ? (
        <button className="w-8 h-8 flex-center bg-surface-3 glow-on-hover" onClick={contact}>
          <FaSun
            className={clsx(
              "text-lg",
              !state.active
                ? state.status === "OPTIMIZING"
                  ? "animate-spin"
                  : state.result.length
                  ? "text-danger-3"
                  : null
                : null
            )}
          />
        </button>
      ) : null}
    </div>
  );
}
