import { ElementType } from "@Calculation";
import { useEffect, useMemo, useState } from "react";
import { Button, clsx, ItemCase, useIntersectionObserver } from "rond";

import { $AppArtifact, $AppCharacter } from "@/services";
import type { UserArtifact } from "@/types";
import Array_ from "@/utils/Array";
import { useSelector } from "@Store/hooks";
import { selectUserArtifacts, selectUserCharacters } from "@Store/userdb-slice";

// Component
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { GenshinImage } from "@/components/GenshinImage";

type EquippedSetOption = {
  character: {
    code: number;
    name: string;
    icon: string;
    elementType: ElementType;
  };
  artifacts: UserArtifact[];
};

type EquippedSetStashProps = {
  keyword?: string;
  onSelectedArtifactChange: (artifact?: UserArtifact) => void;
  onSetSelect: (artifacts: UserArtifact[]) => void;
};

export function EquippedSetStash({
  keyword,
  onSelectedArtifactChange,
  onSetSelect,
}: EquippedSetStashProps) {
  const [selection, setSelection] = useState({
    characterCode: 0,
    artifactId: 0,
  });
  const [empty, setEmpty] = useState(false);

  const characters = useSelector(selectUserCharacters);
  const artifacts = useSelector(selectUserArtifacts);

  const { observedAreaRef, visibleMap, itemUtils } = useIntersectionObserver();

  const shouldCheckKeyword = keyword && keyword.length >= 1;
  const lowerKeyword = keyword?.toLowerCase() ?? "";

  const { options, imgMap } = useMemo(() => {
    const options: EquippedSetOption[] = [];
    const imgMap: Record<string, string> = {};

    for (const character of characters) {
      if (character.artifactIDs.filter(Boolean).length) {
        const appCharacter = $AppCharacter.get(character.name);

        const option: EquippedSetOption = {
          character: {
            code: appCharacter.code,
            name: character.name,
            icon: appCharacter.icon,
            elementType: appCharacter.vision,
          },
          artifacts: [],
        };

        for (const id of character.artifactIDs) {
          const artifact = Array_.findById(artifacts, id);

          if (artifact) {
            option.artifacts.push(artifact);
            imgMap[`${artifact.code}-${artifact.type}`] = $AppArtifact.get(artifact)?.icon ?? "";
          }
        }
        options.push(option);
      }
    }

    return {
      options,
      imgMap,
    };
  }, []);

  useEffect(() => {
    // Check if any item visible
    let visibleCount = 0;
    let shouldCheckChosen = !!selection.characterCode;

    for (const item of itemUtils.queryAll()) {
      if (item.isVisible()) {
        visibleCount++;
      }
      // Unselect if not visible
      else if (shouldCheckChosen && item.getId() === `${selection.characterCode}`) {
        setSelection({
          characterCode: 0,
          artifactId: 0,
        });
        onSelectedArtifactChange(undefined);

        shouldCheckChosen = false;
      }
    }

    setEmpty(!visibleCount);
  }, [keyword]);

  return (
    <div ref={observedAreaRef} className="pr-2 h-full custom-scrollbar">
      {empty ? <p className="py-4 text-light-hint text-lg text-center">No Loadouts found</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {options.map(({ character, artifacts }, i) => {
          const visible = visibleMap[character.code];
          const hidden = shouldCheckKeyword && !character.name.toLowerCase().includes(lowerKeyword);
          const opacityCls = `transition-opacity duration-400 ${
            visible ? "opacity-100" : "opacity-0"
          }`;

          return (
            <div
              key={i}
              {...itemUtils.getProps(character.code, [
                "break-inside-avoid relative",
                hidden && "hidden",
              ])}
            >
              <Button
                className="absolute top-3 right-3"
                variant={character.code === selection.characterCode ? "primary" : "default"}
                size="small"
                onClick={() => onSetSelect(artifacts)}
              >
                Select
              </Button>

              <div className="p-3 rounded-lg bg-dark-1">
                <div className="flex items-start space-x-3">
                  <div className={opacityCls}>
                    {visible ? <CharacterPortrait size="small" info={character} /> : null}
                  </div>
                  <p className={`text-lg text-${character.elementType} font-bold`}>
                    {character.name}
                  </p>
                </div>

                <div className={`mt-3 flex space-x-2`}>
                  {artifacts.map((artifact, j) => {
                    return (
                      <ItemCase
                        key={j}
                        className={`w-12 h-12 cursor-pointer ${opacityCls}`}
                        chosen={artifact.ID === selection.artifactId}
                        onClick={() => {
                          setSelection({
                            characterCode: character.code,
                            artifactId: artifact.ID,
                          });
                          onSelectedArtifactChange(artifact);
                        }}
                      >
                        {(className, imgCls) => {
                          return visible ? (
                            <GenshinImage
                              className={clsx("p-1 rounded-circle", className)}
                              imgCls={imgCls}
                              src={imgMap[`${artifact.code}-${artifact.type}`]}
                              imgType="artifact"
                            />
                          ) : null;
                        }}
                      </ItemCase>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
