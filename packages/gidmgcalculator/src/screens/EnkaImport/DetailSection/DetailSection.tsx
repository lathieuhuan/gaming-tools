import { ReactNode } from "react";
import { clsx } from "rond";

import { CharacterCalc } from "@/calculation-new/core/CharacterCalc";
import { ARTIFACT_TYPES } from "@/constants";
import { useTranslation } from "@/hooks";
import { Artifact, ArtifactGear, CalcCharacter, Weapon } from "@/models/base";
import Array_ from "@/utils/Array";
import { useSelectedBuildState } from "../DataImportProvider";
import { useSaver } from "../SaverProvider";

import { AttributeTable } from "@/components";
import { ArtifactCard } from "@/components/ArtifactCard";
import { WeaponCard } from "@/components/WeaponCard";
import { BuildArtifacts } from "../_components/BuildArtifacts";
import { TabHeader } from "../_components/TabHeader";

type DetailSectionProps = {
  className?: string;
  isMobile?: boolean;
  onBack?: () => void;
};

export function DetailSection({ className, isMobile, onBack }: DetailSectionProps) {
  const { t } = useTranslation();
  const saver = useSaver();
  const [selectedBuild, setSelectedBuild] = useSelectedBuildState();

  if (!selectedBuild) {
    return <div className={className} />;
  }

  const { character, weapon, artifacts, detailType } = selectedBuild;
  let extraTitle = "";
  let content: ReactNode;
  let saveType: "WEAPON" | number | undefined;

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
        />
      );
      saveType = "WEAPON";
      break;
    default: {
      const artifact = artifacts[detailType];

      extraTitle = t(ARTIFACT_TYPES[detailType]);
      content = (
        <ArtifactCard artifact={artifact ? new Artifact(artifact, artifact?.data) : undefined} />
      );
      saveType = detailType;
      break;
    }
  }

  const handleSave = () => {
    saver.save(selectedBuild, saveType);
  };

  return (
    <div className={clsx("flex flex-col", className)}>
      <div className="flex">
        <TabHeader sub={extraTitle} onBack={onBack}>
          <span className={`text-${character.data.vision}`}>{character.data.name}</span>
        </TabHeader>

        {/* <Button icon={<FaSave />} boneOnly onClick={handleSave} /> */}
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
