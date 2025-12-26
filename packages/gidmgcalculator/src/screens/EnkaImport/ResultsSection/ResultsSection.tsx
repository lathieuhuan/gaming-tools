import { clsx } from "rond";

import { ArtifactGear, CalcCharacter } from "@/models/base";
import { GenshinUserBuild } from "@/services/enka";
import { useSetupImporter } from "@/systems/setup-importer";
import Array_ from "@/utils/Array";
import { createArtifact, createWeapon } from "@/utils/entity";
import IdStore from "@/utils/IdStore";
import { useDataImportState } from "../DataImportProvider";
import { useSaver } from "../SaverProvider";

import { TabHeader } from "../_components/TabHeader";
import { BuildOverviews } from "./BuildOverviews";

type ResultsSectionProps = {
  className?: string;
  isMobile?: boolean;
  onBack?: () => void;
};

export function ResultsSection({ className, isMobile, onBack }: ResultsSectionProps) {
  const setupImporter = useSetupImporter();
  const saver = useSaver();
  const { data: genshinUser, isLoading } = useDataImportState();

  const hasAnyBuild = !!genshinUser?.builds?.length;

  const handleCalculate = (build: GenshinUserBuild) => {
    const idStore = new IdStore();
    const weapon = createWeapon(build.weapon, build.weapon.data, idStore);
    const artifacts = Array_.truthify(build.artifacts).map((artifact) =>
      createArtifact(artifact, artifact.data, idStore)
    );
    const atfGear = new ArtifactGear(artifacts);
    const { basic, data } = build.character;
    const character = new CalcCharacter(
      {
        ...basic,
        weapon,
        atfGear,
      },
      data
    );

    setupImporter.import({
      name: build.name,
      type: "original",
      ID: idStore.gen(),
      params: {
        main: character,
      },
      source: "ENKA",
    });
  };

  return (
    <div className={clsx("flex flex-col", className)}>
      <TabHeader sub={hasAnyBuild && "Select a character or an item to see more."} onBack={onBack}>
        Results
      </TabHeader>

      <div className={clsx("mt-2 grow space-y-2 custom-scrollbar", !isMobile && "w-[410px]")}>
        <BuildOverviews
          builds={genshinUser?.builds}
          isLoading={isLoading}
          onSave={saver.save}
          onCalculate={handleCalculate}
        />
      </div>
    </div>
  );
}
