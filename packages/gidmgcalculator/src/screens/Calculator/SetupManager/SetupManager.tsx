import { useState } from "react";
import { FaSkull } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { FaSun } from "react-icons/fa6";
import { Button, Modal, useScreenWatcher } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectTraveler, updateUI } from "@Store/ui-slice";
import { selectActiveId, selectSetupManageInfos } from "@Store/calculator-slice";
import { useOptimizerState } from "../ContextProvider";

// Component
import { SetupSelect } from "./SetupSelect";
import SectionArtifacts from "./SectionArtifacts";
import SectionParty from "./SectionParty";
import SectionTarget from "./SectionTarget";
import SectionWeapon from "./SectionWeapon";

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

          <OptimizationDeptContact />
        </div>
      </div>
    </div>
  );
}

function OptimizationDeptContact() {
  const { toggle } = useOptimizerState();
  const [activeConfirm, setActiveConfirm] = useState(false);
  const infos = useSelector(selectSetupManageInfos);
  const activeId = useSelector(selectActiveId);

  const activeInfo = infos.find((info) => info.ID === activeId);

  return (
    <>
      <Button title="Optimize" icon={<FaSun className="text-lg" />} onClick={() => setActiveConfirm(true)} />

      <Modal
        active={activeConfirm}
        preset="small"
        className="bg-surface-1"
        title="Optimize"
        withActions
        confirmButtonProps={{
          children: "Proceed",
          autoFocus: true,
        }}
        onConfirm={() => {
          toggle("active", true);
          setActiveConfirm(false);
        }}
        onClose={() => setActiveConfirm(false)}
      >
        <ul className="pl-6 pr-2 list-disc space-y-2">
          <li>
            <div className="space-y-1">
              <p>
                Optimize <span className="text-primary-1">{activeInfo?.name}</span>
              </p>
              <p className="text-sm">
                The Optimizer will use every configuration of this Setup except the main character's Artifacts and
                Artifact buffs & debuffs.
              </p>
            </div>
          </li>
        </ul>
      </Modal>
    </>
  );
}
