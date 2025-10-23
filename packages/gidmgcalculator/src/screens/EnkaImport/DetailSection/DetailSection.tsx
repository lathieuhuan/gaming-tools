import { ReactNode } from "react";
import { clsx } from "rond";

import { useTranslation } from "@/hooks";
import { ARTIFACT_TYPES } from "@Calculation";
import { calculationStatsOfBuild } from "../_logic/calculationStatsOfBuild";
import { useSaver } from "../SaverProvider";
import { useSelectedBuildState } from "../DataImportProvider";

import { AttributeTable } from "@/components";
import { ArtifactCard } from "@/components/ArtifactCard";
import { WeaponCard } from "@/components/WeaponCard";
import { BuildArtifact } from "../_components/BuildArtifact";
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
    case "CHARACTER":
      extraTitle = "Attributes";
      content = (
        <AttributeTable
          className="max-h-full hide-scrollbar border-2 border-dark-3 rounded"
          attributes={calculationStatsOfBuild(selectedBuild).totalAttr}
        />
      );
      break;
    case "WEAPON":
      extraTitle = "Weapon";
      content = <WeaponCard wrapperCls="max-h-full hide-scrollbar" weapon={weapon} />;
      saveType = "WEAPON";
      break;
    default:
      extraTitle = t(ARTIFACT_TYPES[detailType]);
      content = <ArtifactCard artifact={artifacts[detailType] ?? undefined} />;
      saveType = detailType;
      break;
  }

  const handleSave = () => {
    saver.save(selectedBuild, saveType);
  };

  return (
    <div className={clsx("flex flex-col", className)}>
      <div className="flex">
        <TabHeader sub={extraTitle} onBack={onBack}>
          <span className={`text-${character.data.vision}`}>{character.name}</span>
        </TabHeader>

        {/* <Button icon={<FaSave />} boneOnly onClick={handleSave} /> */}
      </div>

      <div className="mt-2 grow hide-scrollbar">{content}</div>

      {isMobile && typeof selectedBuild.detailType === "number" && (
        <div className="mt-4 flex justify-center">
          <div className="w-[342px] flex gap-2">
            {selectedBuild.artifacts.map((artifact, index) => (
              <BuildArtifact
                key={index}
                showLevel={false}
                artifact={artifact}
                selectedBuild={selectedBuild}
                artifactType={ARTIFACT_TYPES[index]}
                onClick={() => setSelectedBuild({ ...selectedBuild, detailType: index })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
