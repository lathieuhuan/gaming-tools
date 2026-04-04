import { useEffect, useMemo, useState } from "react";
import { Array_ } from "ron-utils";
import { Button, clsx, ItemCase, useIntersectionObserver } from "rond";

import type { ElementType } from "@/types";

import { createArtifact } from "@/logic/entity.logic";
import { Artifact } from "@/models";
import { $AppCharacter } from "@/services";
import { useSelector } from "@Store/hooks";
import { selectDbArtifacts, selectDbCharacters } from "@Store/userdbSlice";

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
  artifacts: Artifact[];
};

export type EquippedSetStashProps = {
  keyword?: string;
  onSelectArtifact: (artifact?: Artifact) => void;
  onSelectSet: (set: Artifact[]) => void;
};

export function EquippedSetStash({
  keyword,
  onSelectArtifact,
  onSelectSet,
}: EquippedSetStashProps) {
  const [selection, setSelection] = useState({
    characterCode: 0,
    artifactId: 0,
  });
  const [empty, setEmpty] = useState(false);

  const characters = useSelector(selectDbCharacters);
  const artifacts = useSelector(selectDbArtifacts);

  const { observedAreaRef, visibleMap, itemUtils } = useIntersectionObserver();

  const shouldCheckKeyword = keyword && keyword.length >= 1;
  const lowerKeyword = keyword?.toLowerCase() ?? "";

  const setOptions = useMemo(() => {
    const options: EquippedSetOption[] = [];

    for (const character of characters) {
      if (!character.artifactIDs.length) {
        continue;
      }

      const appCharacter = $AppCharacter.get(character.code);

      const option: EquippedSetOption = {
        character: {
          code: appCharacter.code,
          name: appCharacter.name,
          icon: appCharacter.icon,
          elementType: appCharacter.vision,
        },
        artifacts: [],
      };

      for (const id of character.artifactIDs) {
        const rawAtf = Array_.findById(artifacts, id);

        if (rawAtf) {
          option.artifacts.push(createArtifact(rawAtf));
        }
      }

      options.push(option);
    }

    return options;
  }, []);

  useEffect(() => {
    // Check if any item visible
    let visibleCount = 0;
    let shouldCheckSelected = !!selection.characterCode;

    for (const item of itemUtils.queryAll()) {
      if (item.isVisible()) {
        visibleCount++;
      }
      // Unselect if not visible
      else if (shouldCheckSelected && item.getId() === `${selection.characterCode}`) {
        setSelection({
          characterCode: 0,
          artifactId: 0,
        });
        onSelectArtifact(undefined);

        shouldCheckSelected = false;
      }
    }

    setEmpty(!visibleCount);
  }, [keyword]);

  return (
    <div ref={observedAreaRef} className="pr-2 h-full custom-scrollbar">
      {empty ? <p className="py-4 text-light-hint text-lg text-center">No Loadouts found</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {setOptions.map(({ character, artifacts }, i) => {
          const visible = visibleMap[character.code];
          const hidden = shouldCheckKeyword && !character.name.toLowerCase().includes(lowerKeyword);
          const opacityCls = `transition-opacity duration-400 ${
            visible ? "opacity-100" : "opacity-0"
          }`;

          return (
            <div
              key={character.code}
              {...itemUtils.getProps(character.code, [
                "break-inside-avoid relative",
                hidden && "hidden",
              ])}
            >
              <Button
                className="absolute top-3 right-3"
                variant={character.code === selection.characterCode ? "primary" : "default"}
                size="small"
                onClick={() => onSelectSet(artifacts)}
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

                <div className="mt-3 h-12 flex space-x-2">
                  {artifacts.map((artifact) => {
                    const { ID } = artifact;

                    return (
                      <ItemCase
                        key={ID}
                        className={`w-12 h-12 cursor-pointer ${opacityCls}`}
                        selected={ID === selection.artifactId}
                        onClick={() => {
                          setSelection({
                            characterCode: character.code,
                            artifactId: ID,
                          });
                          onSelectArtifact(artifact);
                        }}
                      >
                        {(className, imgCls) => {
                          return visible ? (
                            <GenshinImage
                              className={clsx("p-1 rounded-circle", className)}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
