import { ReactNode } from "react";
import { FaSave } from "react-icons/fa";
import { Array_ } from "ron-utils";
import { ClassValue, clsx } from "rond";

import { ARTIFACT_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { createArtifact } from "@/logic/entity.logic";
import { ArtifactGear, CharacterCalc, Weapon } from "@/models";
import { useSelectedBuildState } from "../DataImporter";
import { useRequestSaveItem } from "../DataSaver/ItemSaver";
import { useLayoutState } from "../Layout";

import { AttributeTable } from "@/components";
import { ArtifactCard } from "@/components/ArtifactCard";
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

  const { character, weapon, artifacts, detailType } = selectedBuild;
  let extraTitle = "";
  let content: ReactNode;

  switch (detailType) {
    case "CHARACTER": {
      const atfPieces = Array_.truthify(artifacts).map((artifact) => createArtifact(artifact));
      const characterCalc = new CharacterCalc(
        {
          ...character.basic,
          weapon: new Weapon(weapon, weapon.data),
          atfGear: new ArtifactGear(atfPieces),
        },
        character.data
      );
      const allAttrs = characterCalc.initCalc().allAttrsCtrl.finalize();

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
          weapon={new Weapon(weapon, weapon.data)}
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
      const artifact = artifacts[detailType];

      extraTitle = t(ARTIFACT_TYPES[detailType]);
      content = (
        <ArtifactCard
          artifact={artifact ? createArtifact(artifact) : undefined}
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
