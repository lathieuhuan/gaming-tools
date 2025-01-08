import { FaSkull } from "react-icons/fa";
import { FaSun } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { Button, clsx, useScreenWatcher } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectTraveler, updateUI } from "@Store/ui-slice";
import { useCalcModalCtrl, useOptimizeSystem } from "../ContextProvider";

// Component
import SectionArtifacts from "./SectionArtifacts";
import SectionParty from "./SectionParty";
import SectionTarget from "./SectionTarget";
import SectionWeapon from "./SectionWeapon";
import { SetupSelect } from "./SetupSelect";

interface SetupManagerProps {
  isModernUI?: boolean;
}
export function SetupManager({ isModernUI = false }: SetupManagerProps) {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const targetConfig = useSelector((state) => state.ui.calcTargetConfig);
  const traveler = useSelector(selectTraveler);

  const updateTargetConfig = (active: boolean, onOverview: boolean) => {
    dispatch(updateUI({ calcTargetConfig: { active, onOverview } }));
  };

  const onClickTargetConfigButton = () => {
    updateTargetConfig(true, false);
  };

  const renderMainContent = (cls = "") => (
    <div className={`hide-scrollbar space-y-2 scroll-smooth ${cls}`}>
      <SectionParty key={traveler} />
      <SectionWeapon />
      <SectionArtifacts />

      {targetConfig.onOverview ? (
        <SectionTarget
          onMinimize={() => updateTargetConfig(false, false)}
          onEdit={() => updateTargetConfig(true, true)}
        />
      ) : null}
    </div>
  );

  if (!screenWatcher.isFromSize("sm") && isModernUI) {
    return renderMainContent("h-full");
  }

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="mb-3">
        <SetupSelect />
      </div>

      {renderMainContent("grow")}

      <div className="mt-4 grid grid-cols-3">
        <div />

        <div className="flex-center">
          <Button
            className="mx-auto"
            title="Setup Manager"
            icon={<IoDocumentText className="text-xl" />}
            onClick={() => dispatch(updateUI({ setupDirectorActive: true }))}
          />
        </div>

        <div className="flex justify-end gap-3">
          {!targetConfig.onOverview ? (
            <Button
              title="Target"
              boneOnly
              icon={<FaSkull className="text-lg" />}
              onClick={onClickTargetConfigButton}
            />
          ) : null}

          <OptimizeDeptContact />
        </div>
      </div>
    </div>
  );
}

function OptimizeDeptContact() {
  const modalCtrl = useCalcModalCtrl();
  const { state, openDept } = useOptimizeSystem();
  const loading = state.status === "WORKING";

  return (
    <div className="">
      <Button
        title="Optimizer"
        className="relative"
        icon={
          <>
            <FaSun className={clsx("text-lg", !state.active && loading && "animate-spin")} />

            {!state.active && state.result.length ? (
              <span className="absolute bg-danger-1 block w-3 h-3 rounded-circle" style={{ top: "-4px", right: 0 }} />
            ) : null}
          </>
        }
        onClick={() => {
          if (loading || state.result.length) {
            openDept();
          } else {
            modalCtrl.requestOptimizer();
          }
        }}
      />
    </div>
  );
}
