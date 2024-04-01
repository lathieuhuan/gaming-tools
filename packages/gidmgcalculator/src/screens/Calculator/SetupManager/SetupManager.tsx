import { FaSkull } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { Button, useScreenWatcher } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

// Component
import { SetupSelect } from "./SetupSelect";
import SectionArtifacts from "./SectionArtifacts";
import SectionParty from "./SectionParty";
import SectionTarget from "./SectionTarget";
import SectionWeapon from "./SectionWeapon";

export function SetupManager() {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const targetConfig = useSelector((state) => state.ui.calcTargetConfig);

  const isMobile = screenWatcher.isToSize("sm");

  const updateTargetConfig = (active: boolean, onOverview: boolean) => {
    dispatch(updateUI({ calcTargetConfig: { active, onOverview } }));
  };

  const renderMainContent = (cls = "") => (
    <div className={`hide-scrollbar space-y-2 scroll-smooth ${cls}`}>
      <SectionParty />
      <SectionWeapon />
      <SectionArtifacts />

      {targetConfig.onOverview && (
        <SectionTarget
          onMinimize={() => updateTargetConfig(false, false)}
          onEdit={() => updateTargetConfig(true, true)}
        />
      )}
    </div>
  );

  if (isMobile) {
    return renderMainContent("h-full");
  }

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="mb-3">
        <SetupSelect />
      </div>

      {renderMainContent("grow")}

      <div className="mt-4 grid grid-cols-3">
        <div className="flex items-center">
          {!targetConfig.onOverview && (
            <Button boneOnly icon={<FaSkull />} onClick={() => updateTargetConfig(true, false)} />
          )}
        </div>

        <div className="flex-center">
          <Button
            className="mx-auto"
            icon={<IoDocumentText />}
            onClick={() => dispatch(updateUI({ setupDirectorActive: true }))}
          />
        </div>
      </div>
    </div>
  );
}
