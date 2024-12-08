import { FaSkull } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { Button, useScreenWatcher } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { selectTraveler, updateUI } from "@Store/ui-slice";

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

  const isMobile = !screenWatcher.isFromSize("sm");

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

  if (isMobile && isModernUI) {
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
          {!targetConfig.onOverview ? <Button boneOnly icon={<FaSkull />} onClick={onClickTargetConfigButton} /> : null}
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
