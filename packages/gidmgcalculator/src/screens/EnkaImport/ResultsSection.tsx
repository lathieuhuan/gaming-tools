import { useRef, useState } from "react";
import { clsx, ConfirmModal, notification, Skeleton } from "rond";

import { GenshinUser, GenshinUserBuild } from "@/hooks/queries/useGenshinUser";
import { $AppSettings } from "@/services";
import { ConvertedArtifact, ConvertedWeapon } from "@/services/app-data";
import { useStore } from "@/systems/dynamic-store";
import { useSetupImporter } from "@/systems/setup-importer";
import { UserArtifact } from "@/types";
import Setup_ from "@/utils/setup-utils";
import { useDispatch } from "@Store/hooks";
import { addCharacter, addUserArtifact, addUserWeapon } from "@Store/userdb-slice";

import { ArtifactCard, WeaponCard } from "@/components";
import { BuildOverview } from "./BuildOverview";

type ResultsSectionProps = {
  className?: string;
  user?: GenshinUser;
  isLoading?: boolean;
};

export function ResultsSection({ className, user, isLoading }: ResultsSectionProps) {
  const dispatch = useDispatch();
  const store = useStore();
  const setupImporter = useSetupImporter();

  const [selectedArtifact, setSelectedArtifact] = useState<ConvertedArtifact>();
  const [selectedWeapon, setSelectedWeapon] = useState<ConvertedWeapon>();
  const [pendingBuild, setPendingBuild] = useState<GenshinUserBuild>();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectArtifact = (artifact: ConvertedArtifact) => {
    const isSelected = artifact.ID === selectedArtifact?.ID;

    setSelectedArtifact(isSelected ? undefined : artifact);
    setSelectedWeapon(undefined);

    if (!isSelected) {
      containerRef.current?.scrollTo({
        left: containerRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handleSelectWeapon = (weapon: ConvertedWeapon) => {
    const isSelected = weapon.ID === selectedWeapon?.ID;

    setSelectedWeapon(isSelected ? undefined : weapon);
    setSelectedArtifact(undefined);

    if (!isSelected) {
      containerRef.current?.scrollTo({
        left: 9999,
        behavior: "smooth",
      });
    }
  };

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
      <div>
        <p className="font-semibold">Results</p>
      </div>

      <div ref={containerRef} className="mt-2 grow flex gap-4 custom-scrollbar">
        <div className="h-full space-y-2 shrink-0 custom-scrollbar">
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-40 w-[380px] rounded-lg" />
                <Skeleton className="h-40 w-[380px] rounded-lg" />
              </>
            ) : user ? (
              user.builds.map((build, index) => {
                return (
                  <BuildOverview
                    key={index}
                    {...build}
                    selectedId={selectedWeapon?.ID || selectedArtifact?.ID}
                    onSelectArtifact={handleSelectArtifact}
                    onSelectWeapon={handleSelectWeapon}
                    onSave={() => handleSave(build)}
                    onCalculate={() => handleCalculate(build)}
                  />
                );
              })
            ) : (
              <div className="w-[380px] p-4 py-6 flex-center">
                <p className="text-hint-color">No results found</p>
              </div>
            )}
          </div>
        </div>

        {user && !isLoading && (
          <div className="w-80 h-full shrink-0 custom-scrollbar">
            {selectedWeapon && <WeaponCard weapon={selectedWeapon} />}
            {selectedArtifact && <ArtifactCard artifact={selectedArtifact} />}

            {!selectedArtifact && !selectedWeapon && (
              <div className="p-4 py-6 flex-center">
                <p className="text-hint-color">Select an item to see its details</p>
              </div>
            )}
          </div>
        )}
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
