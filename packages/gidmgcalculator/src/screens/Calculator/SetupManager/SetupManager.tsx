import ReactDOM from "react-dom";
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

interface SetupManagerProps {
  isModernUI: boolean;
}
export function SetupManager({ isModernUI }: SetupManagerProps) {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const targetConfig = useSelector((state) => state.ui.calcTargetConfig);

  const isMobile = !screenWatcher.isFromSize("sm");

  const updateTargetConfig = (active: boolean, onOverview: boolean) => {
    dispatch(updateUI({ calcTargetConfig: { active, onOverview } }));
  };

  const onClickTargetConfigButton = () => {
    updateTargetConfig(true, false);
  };

  const renderMainContent = (cls = "") => (
    <div className={`hide-scrollbar space-y-2 scroll-smooth ${cls}`}>
      <SectionParty />
      <SectionWeapon />
      <SectionArtifacts />

      {targetConfig.onOverview ? (
        <SectionTarget
          onMinimize={() => updateTargetConfig(false, false)}
          onEdit={() => updateTargetConfig(true, true)}
        />
      ) : isModernUI ? (
        ReactDOM.createPortal(
          <ModernButton onClick={onClickTargetConfigButton} />,
          document.getElementById("nav-slot")!
        )
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

function ModernButton(props: { onClick: () => void }) {
  const atScreen = useSelector((state) => state.ui.atScreen);

  return atScreen === "CALCULATOR" ? (
    <button className="w-8 h-8 flex-center bg-surface-3" onClick={props.onClick}>
      <FaSkull />
    </button>
  ) : null;
}
