import { clsx } from "rond";

import { $AppSettings } from "@/services";
import { GenshinUser, GenshinUserBuild } from "@/services/enka";
import { useSetupImporter } from "@/systems/setup-importer";
import Setup_ from "@/utils/Setup";
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
      <TabHeader sub="Select a character or an item to see more." onBack={onBack}>
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
