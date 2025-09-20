import { FaCalculator, FaSave } from "react-icons/fa";
import { Button, ItemCase } from "rond";

import { ARTIFACT_TYPES } from "@Calculation";
import { GenshinUserBuild } from "@/hooks/queries/useGenshinUser";
import { ConvertedArtifact, ConvertedWeapon } from "@/services/app-data";
import Entity_ from "@/utils/Entity";

import { CharacterPortrait, GenshinImage, ItemThumbnail } from "@/components";

type BuildOverviewProps = GenshinUserBuild & {
  selectedId?: number;
  onSelectArtifact?: (item: ConvertedArtifact) => void;
  onSelectWeapon?: (item: ConvertedWeapon) => void;
  onSave?: () => void;
  onCalculate?: () => void;
};

export function BuildOverview({
  name,
  character,
  weapon,
  artifacts,
  selectedId,
  onSelectArtifact,
  onSelectWeapon,
  onSave,
  onCalculate,
}: BuildOverviewProps) {
  const buildName = name || character?.name;

  return (
    <div className="p-3 bg-surface-1 rounded-lg">
      <div className="flex gap-3">
        <CharacterPortrait info={{ icon: character.data.icon }} size="small" />

        <div className="text-sm">
          <p className={`text-lg font-bold text-${character.data.vision}`}>{buildName}</p>
          <p>
            {character.level} <span className="text-hint-color opacity-50">|</span> C{character.cons}{" "}
            <span className="text-hint-color opacity-50">|</span> {character.NAs} - {character.ES} - {character.EB}
          </p>
        </div>

        <div className="ml-auto flex gap-2">
          <Button icon={<FaSave />} onClick={onSave} />
          <Button icon={<FaCalculator />} onClick={onCalculate} />
        </div>
      </div>

      <div className="mt-4 flex gap-1">
        <ItemCase className="size-14" chosen={weapon.ID === selectedId} onClick={() => onSelectWeapon?.(weapon)}>
          {(className, imgCls) => (
            <ItemThumbnail
              className={className}
              imgCls={imgCls}
              item={{
                icon: weapon.data.icon,
                level: weapon.level,
                rarity: weapon.data.rarity,
                refi: weapon.refi,
              }}
              compact
            />
          )}
        </ItemCase>

        {artifacts.map((artifact, index) => {
          if (artifact) {
            const icon = artifact.data[artifact.type].icon;

            return (
              <ItemCase
                key={index}
                className="size-14"
                chosen={artifact.ID === selectedId}
                onClick={() => onSelectArtifact?.(artifact)}
              >
                {(className, imgCls) => (
                  <ItemThumbnail
                    className={className}
                    imgCls={imgCls}
                    item={{ icon, level: artifact.level, rarity: artifact.rarity }}
                    compact
                  />
                )}
              </ItemCase>
            );
          }

          return (
            <div key={index} className="size-14 p-2 bg-surface-3 rounded opacity-50">
              <GenshinImage className="w-full" src={Entity_.artifactIconOf(ARTIFACT_TYPES[index])} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
