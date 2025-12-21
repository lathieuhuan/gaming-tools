import { FaSkull } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { Button, useScreenWatcher } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectTargetConfig, updateUI } from "@Store/ui-slice";

// Component
import SectionArtifacts from "./SectionArtifacts";
import SectionTarget from "./SectionTarget";
import SectionTeammates from "./SectionTeammates";
import SectionWeapon from "./SectionWeapon";
import { SetupSelect } from "./SetupSelect";

export function SetupManager() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const targetConfig = useSelector(selectTargetConfig);
  const isModernUI = useSelector((state) => state.ui.isTabLayout);

  const updateTargetConfig = (active: boolean, overviewed: boolean) => {
    dispatch(updateUI({ targetConfig: { active, overviewed } }));
  };

  const onClickTargetConfigButton = () => {
    updateTargetConfig(true, false);
  };

  const renderMainContent = (cls = "") => (
    <div className={`hide-scrollbar space-y-2 scroll-smooth ${cls}`}>
      <SectionTeammates />
      <SectionWeapon />
      <SectionArtifacts />

      {targetConfig.overviewed ? (
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
          {!targetConfig.overviewed ? (
            <Button
              title="Target"
              boneOnly
              icon={<FaSkull className="text-lg" />}
              onClick={onClickTargetConfigButton}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
