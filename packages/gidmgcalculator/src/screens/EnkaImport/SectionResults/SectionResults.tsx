import { ClassValue, clsx } from "rond";

import { createCharacter } from "@/logic/entity.logic";
import { GenshinUserBuild } from "@/services/enka";
import { IdStore } from "@/utils/IdStore";
import { sendToImportCenter } from "@Store/ui";
import { useDataImportState } from "../DataImporter";
import { useRequestSaveBuild } from "../DataSaver/BuildSaver";
import { useLayoutState } from "../Layout";

import { TabHeader } from "../components/TabHeader";
import { BuildOverviews } from "./BuildOverviews";

type SectionResultsProps = {
  className?: ClassValue;
};

export function SectionResults({ className }: SectionResultsProps) {
  const requestSave = useRequestSaveBuild();
  const { isMobile } = useLayoutState();
  const { data: genshinUser, isLoading } = useDataImportState();

  const hasAnyBuild = !!genshinUser?.builds?.length;

  const handleCalculate = (build: GenshinUserBuild) => {
    const idStore = new IdStore();
    const { basic, data } = build.character;
    const character = createCharacter(basic, data, {
      weapon: build.weapon,
      atfGear: build.atfGear,
    });

    sendToImportCenter(
      {
        main: character,
      },
      {
        id: idStore.gen(),
        name: build.name,
        type: "original",
        source: "ENKA",
      },
    );
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
