import { ReactNode } from "react";
import { FaSave } from "react-icons/fa";
import { ClassValue, clsx } from "rond";

import { useTranslation } from "@/hooks";
import { createCharacter } from "@/logic/entity.logic";
import { useSelectedBuildState } from "../DataImporter";
import { useRequestSaveItem } from "../DataSaver/ItemSaver";
import { useLayoutState } from "../Layout";

import { ArtifactCard } from "@/components/ArtifactCard";
import { AttributeTable } from "@/components/AttributeTable";
import { WeaponCard } from "@/components/WeaponCard";
import { BuildArtifacts } from "../components/BuildArtifacts";
import { TabHeader } from "../components/TabHeader";

type SectionDetailProps = {
  className?: ClassValue;
};

export function SectionDetail({ className }: SectionDetailProps) {
  const { t } = useTranslation();
  const { isMobile } = useLayoutState();
  const requestSave = useRequestSaveItem();
  const [selectedBuild] = useSelectedBuildState();

  if (!selectedBuild) {
    return <div className={clsx(className)} />;
  }

  const { character, weapon, atfGear, detailType } = selectedBuild;
  let extraTitle = "";
  let content: ReactNode;

  switch (detailType) {
    case "CHARACTER": {
      const $character = createCharacter(character.basic, character.data, {
        weapon,
        atfGear,
      });
      const allAttrs = $character.initCalculation().allAttrsCtrl.finalize();

      extraTitle = "Attributes";
      content = (
        <AttributeTable
          className="max-h-full hide-scrollbar border-2 border-dark-3 rounded"
          attributes={allAttrs}
        />
      );
      break;
    }
    case "WEAPON":
      extraTitle = "Weapon";
      content = (
        <WeaponCard
          wrapperCls="max-h-full hide-scrollbar"
          weapon={weapon}
          actions={[
            {
              children: "Save",
              icon: <FaSave />,
              onClick: () => requestSave(selectedBuild, "WEAPON"),
            },
          ]}
        />
      );
      break;

    default: {
      const artifact = atfGear.pieces.get(detailType);

      extraTitle = t(detailType);
      content = (
        <ArtifactCard
          artifact={artifact}
          actions={[
            {
              children: "Save",
              icon: <FaSave />,
              onClick: () => requestSave(selectedBuild, detailType),
            },
          ]}
        />
      );
      break;
    }
  }

  return (
    <div className={clsx("p-4 flex flex-col", className)}>
      <div className="flex">
        <TabHeader sub={extraTitle} prevSection="RESULTS">
          <span className={`text-${character.data.vision}`}>{character.data.name}</span>
        </TabHeader>
      </div>

      <div className="mt-2 grow hide-scrollbar">{content}</div>

      {isMobile && typeof selectedBuild.detailType === "number" && (
        <div className="mt-4 flex justify-center">
          <div className="w-[342px] flex gap-2">
            <BuildArtifacts build={selectedBuild} showLevel={false} />
          </div>
        </div>
      )}
    </div>
  );
}
