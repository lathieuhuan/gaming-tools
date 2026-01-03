import { ReactNode } from "react";
import { FaSave } from "react-icons/fa";
import { ClassValue, clsx } from "rond";

import { CharacterCalc } from "@/calculation/core/CharacterCalc";
import { ARTIFACT_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { Artifact, ArtifactGear, CalcCharacter, Weapon } from "@/models/base";
import Array_ from "@/utils/Array";
import { useContainerState } from "../Container";
import { useSelectedBuildState } from "../DataImportProvider";
import { useRequestSaveItem } from "../DataSaver/ItemSaver";

import { AttributeTable } from "@/components";
import { ArtifactCard } from "@/components/ArtifactCard";
import { WeaponCard } from "@/components/WeaponCard";
import { BuildArtifacts } from "../_components/BuildArtifacts";
import { TabHeader } from "../_components/TabHeader";

type SectionDetailProps = {
  className?: ClassValue;
};

export function SectionDetail({ className }: SectionDetailProps) {
  const { t } = useTranslation();
  const { isMobile } = useContainerState();
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
      const atfPieces = Array_.truthify(artifacts).map(
        (artifact) => new Artifact(artifact, artifact.data)
      );
      const calcCharacter = new CalcCharacter(
        {
          ...character.basic,
          weapon: new Weapon(weapon, weapon.data),
          atfGear: new ArtifactGear(atfPieces),
        },
        character.data
      );
      const calc = new CharacterCalc(calcCharacter, calcCharacter.data, calcCharacter.team);

      calc.initTotalAttr();

      extraTitle = "Attributes";
      content = (
        <AttributeTable
          className="max-h-full hide-scrollbar border-2 border-dark-3 rounded"
          attributes={calc.totalAttrCtrl.finalize()}
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
          // actions={[
          //   {
          //     children: "Save",
          //     icon: <FaSave />,
          //     onClick: () => requestSave(selectedBuild, "WEAPON"),
          //   },
          // ]}
        />
      );
      break;

    default: {
      const artifact = artifacts[detailType];

      extraTitle = t(ARTIFACT_TYPES[detailType]);
      content = (
        <ArtifactCard
          artifact={artifact ? new Artifact(artifact, artifact?.data) : undefined}
          // actions={[
          //   {
          //     children: "Save",
          //     icon: <FaSave />,
          //     onClick: () => requestSave(selectedBuild, detailType),
          //   },
          // ]}
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
