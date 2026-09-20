import { FaSkull } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { Button, clsx, useScreenWatcher } from "rond";

import { useSettingsStore } from "@Store/settings";
import { updateUI, useUIStore } from "@Store/ui";

// Component
import { SectionArtifacts } from "./SectionArtifacts";
import { SectionTarget } from "./SectionTarget";
import { SectionTeammates } from "./SectionTeammates";
import { SectionWeapon } from "./SectionWeapon";
import { SetupSelect } from "./SetupSelect";

export function SetupManager() {
  const screenWatcher = useScreenWatcher();
  const targetConfig = useUIStore((state) => state.targetConfig);
  const isTabLayout = useSettingsStore((state) => state.isTabLayout);

  const updateTargetConfig = (newState: { active: boolean; overviewed: boolean }) => {
    updateUI({ targetConfig: newState });
  };

  const renderMainContent = (className?: string) => (
    <div className={clsx("hide-scrollbar space-y-2 scroll-smooth", className)}>
      <SectionTeammates />
      <SectionWeapon />
      <SectionArtifacts />

      {targetConfig.overviewed && (
        <SectionTarget
          onMinimize={() => {
            updateTargetConfig({
              active: false,
              overviewed: false,
            });
          }}
          onEdit={() => {
            updateTargetConfig({
              active: true,
              overviewed: true,
            });
          }}
        />
      )}
    </div>
  );

  if (!screenWatcher.isFromSize("sm") && isTabLayout) {
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
            onClick={() => updateUI({ setupDirectorActive: true })}
          />
        </div>

        <div className="flex justify-end gap-3">
          {!targetConfig.overviewed && (
            <Button
              title="Target"
              boneOnly
              icon={<FaSkull className="text-lg" />}
              onClick={() => {
                updateTargetConfig({
                  active: true,
                  overviewed: false,
                });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
