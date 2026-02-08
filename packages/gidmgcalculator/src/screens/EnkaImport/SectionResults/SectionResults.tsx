import { ClassValue, clsx } from "rond";

import { ArtifactGear } from "@/models/base";
import { CharacterCalc } from "@/models/calculation";
import { GenshinUserBuild } from "@/services/enka";
import { useSetupImporter } from "@/systems/setup-importer";
import Array_ from "@/utils/Array";
import { createArtifact, createWeapon } from "@/utils/entity";
import IdStore from "@/utils/IdStore";
import { useDataImportState } from "../DataImporter";
import { useRequestSaveBuild } from "../DataSaver/BuildSaver";
import { useLayoutState } from "../Layout";

import { TabHeader } from "../_components/TabHeader";
import { BuildOverviews } from "./BuildOverviews";

type SectionResultsProps = {
  className?: ClassValue;
};

export function SectionResults({ className }: SectionResultsProps) {
  const setupImporter = useSetupImporter();
  const requestSave = useRequestSaveBuild();
  const { isMobile } = useLayoutState();
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
    const character = new CharacterCalc(
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
    <div className={clsx("p-4 flex flex-col", className)}>
      <TabHeader
        sub={hasAnyBuild && "Select a character or an item to see more."}
        prevSection="COVER"
      >
        Results
      </TabHeader>

      <div className={clsx("mt-2 grow space-y-2 custom-scrollbar", !isMobile && "w-[410px]")}>
        <BuildOverviews
          builds={genshinUser?.builds}
          isLoading={isLoading}
          onSave={requestSave}
          onCalculate={handleCalculate}
        />
      </div>
    </div>
  );
}
