import { ItemCase } from "rond";

import type { Artifact } from "@/models";
import type { ElementType } from "@/types";

import { CharacterPortrait } from "../CharacterPortrait";
import { GenshinImage } from "../GenshinImage";

export type EquippedSetOwner = {
  code: number;
  name: string;
  icon: string;
  elementType: ElementType;
};

export type EquippedSetProps = {
  owner: EquippedSetOwner;
  artifacts: Artifact[];
  selectedArtifactId: number;
  viewed: boolean;
  onClickItem: (artifact: Artifact) => void;
};

export function EquippedSet({
  owner,
  artifacts,
  selectedArtifactId,
  viewed,
  onClickItem,
}: EquippedSetProps) {
  const opacityCls = "transition-opacity duration-400 " + (viewed ? "opacity-100" : "opacity-0");

  return (
    <div className="p-3 rounded-lg bg-dark-1">
      <div className="flex items-start space-x-3">
        <div className={opacityCls}>
          {viewed && <CharacterPortrait size="small" info={owner} />}
        </div>
        <p className={`text-lg text-${owner.elementType} font-bold`}>{owner.name}</p>
      </div>

      <div className="mt-3 h-12 flex space-x-2">
        {artifacts.map((artifact) => {
          return (
            <ItemCase
              key={artifact.ID}
              className={`w-12 h-12 cursor-pointer ${opacityCls}`}
              selected={artifact.ID === selectedArtifactId}
              onClick={() => onClickItem(artifact)}
            >
              {(className, imgCls) => {
                return viewed ? (
                  <GenshinImage
                    className={`p-1 rounded-circle ${className}`}
                    imgCls={imgCls}
                    src={artifact.icon}
                    imgType="artifact"
                  />
                ) : null;
              }}
            </ItemCase>
          );
        })}
      </div>
    </div>
  );
}
