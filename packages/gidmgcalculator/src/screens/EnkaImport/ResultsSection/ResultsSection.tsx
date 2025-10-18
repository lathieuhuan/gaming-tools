import { useState } from "react";
import { Button, clsx, ConfirmModal, FancyBackSvg, notification } from "rond";

import { $AppSettings } from "@/services";
import { GenshinUser, GenshinUserBuild } from "@/services/enka";
import { useStore } from "@/systems/dynamic-store";
import { useSetupImporter } from "@/systems/setup-importer";
import { UserArtifact } from "@/types";
import Setup_ from "@/utils/Setup";
import { useDispatch } from "@Store/hooks";
import { addCharacter, addUserArtifact, addUserWeapon } from "@Store/userdb-slice";

import { BuildOverviews } from "./BuildOverviews";
import { TabHeader } from "../_components/TabHeader";

type ResultsSectionProps = {
  className?: string;
  user?: GenshinUser;
  isLoading?: boolean;
  onBack?: () => void;
};

export function ResultsSection({
  className,
  user,
  isLoading,
  onBack,
}: ResultsSectionProps) {
  const dispatch = useDispatch();
  const store = useStore();
  const setupImporter = useSetupImporter();

  const [pendingBuild, setPendingBuild] = useState<GenshinUserBuild>();

  const handleSave = (build: GenshinUserBuild) => {
    const existCharacter = store.select((state) =>
      state.userdb.userChars.find((char) => char.name === build.character.name)
    );

    if (existCharacter && !pendingBuild) {
      setPendingBuild(build);
      return;
    }

    const userArtifacts: UserArtifact[] = [];

    for (const artifact of build.artifacts) {
      if (artifact) {
        userArtifacts.push({
          ...artifact,
          owner: build.character.name,
        });
      }
    }

    dispatch(
      addCharacter({
        weaponID: build.weapon.ID,
        artifactIDs: build.artifacts.map((artifact) => artifact?.ID || null),
        ...build.character,
      })
    );
    dispatch(
      addUserWeapon({
        ...build.weapon,
        owner: build.character.name,
      })
    );
    dispatch(addUserArtifact(userArtifacts));

    notification.success({
      content: `Successfully saved ${build.character.name}`,
    });
  };

  const handleCalculate = (build: GenshinUserBuild) => {
    const { data: _, ...character } = build.character;
    const { data: __, ...weapon } = build.weapon;
    const artifacts = build.artifacts.map((artifact) => {
      if (artifact) {
        const { data, ...rest } = artifact;
        return rest;
      }
      return null;
    });

    setupImporter.import({
      name: build.name,
      type: "original",
      calcSetup: Setup_.createCalcSetup({
        char: character,
        weapon,
        artifacts,
      }),
      target: Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
      importSource: "ENKA",
    });
  };

  return (
    <div className={clsx("flex flex-col", className)}>
      <TabHeader onBack={onBack}>
        <p className="font-semibold">Results</p>
        <p className="text-sm text-light-hint">Select a character or an item to see more.</p>
      </TabHeader>

      <div className="mt-2 grow space-y-2 custom-scrollbar">
        <BuildOverviews
          // className="w-95"
          builds={user?.builds}
          isLoading={isLoading}
          onSave={handleSave}
          onCalculate={handleCalculate}
        />
      </div>

      <ConfirmModal
        active={!!pendingBuild}
        message={`${pendingBuild?.character.name} is already saved in your characters. Overwrite?`}
        confirmButtonProps={{
          variant: "danger",
        }}
        focusConfirm
        onConfirm={() => handleSave(pendingBuild!)}
        onClose={() => setPendingBuild(undefined)}
      />
    </div>
  );
}
