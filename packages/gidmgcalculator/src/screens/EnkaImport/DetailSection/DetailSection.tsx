import { ReactNode } from "react";
import { FaSave } from "react-icons/fa";
import { Button, clsx } from "rond";

import { useTranslation } from "@/hooks";
import { ARTIFACT_TYPES } from "@Calculation";
import { calculationStatsOfBuild } from "../_logic/calculationStatsOfBuild";
import { useSelectedBuildState } from "../SelectedBuildProvider";

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
  const [selectedBuild] = useSelectedBuildState();

  if (!selectedBuild) {
    return <div className={className} />;
  }

  const { character, weapon, artifacts } = selectedBuild;
  let extraTitle = "";
  let content: ReactNode;

  switch (selectedBuild.detailType) {
    case "CHARACTER":
      content = <AttributeTable attributes={calculationStatsOfBuild(selectedBuild).totalAttr} />;
      break;
    case "WEAPON":
      extraTitle = "Weapon";
      content = <WeaponCard wrapperCls="max-h-full hide-scrollbar" weapon={weapon} />;
      break;
    default:
      extraTitle = t(ARTIFACT_TYPES[selectedBuild.detailType]);
      content = <ArtifactCard artifact={artifacts[selectedBuild.detailType] ?? undefined} />;
      break;
  }

  const handleSave = () => {
    console.log("save");
  };

  return (
    <div className={clsx("flex flex-col", className)}>
      <TabHeader className="flex items-center" onBack={onBack}>
        <p className="text-lg">
          <span className={`font-bold text-${character.data.vision}`}>{character.name}</span>
          {extraTitle && ` / ${extraTitle}`}
        </p>

        <Button icon={<FaSave />} boneOnly onClick={handleSave} />
      </TabHeader>

      <div
        className={clsx(
          "mt-3 grow hide-scrollbar",
          selectedBuild.detailType === "CHARACTER" && "border-t border-dark-line"
        )}
      >
        {content}
      </div>

      {isMobile && typeof selectedBuild.detailType === "number" && (
        <BuildArtifacts showLevel={false} build={selectedBuild} />
      )}
    </div>
  );
}
