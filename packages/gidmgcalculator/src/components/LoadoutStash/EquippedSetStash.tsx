import { useEffect, useMemo, useState } from "react";
import { Array_ } from "ron-utils";
import { Button, useIntersectionObserver } from "rond";

import { createArtifact } from "@/logic/entity.logic";
import { Artifact } from "@/models";
import { getAppCharacter } from "@/services/app-data";
import { useSelector } from "@Store/hooks";
import { selectDbArtifacts, selectDbCharacters } from "@Store/userdbSlice";

// Component
import { EquippedSet, type EquippedSetOwner } from "./EquippedSet";

type EquippedSetOption = {
  owner: EquippedSetOwner;
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

  const characters = useSelector(selectDbCharacters);
  const artifacts = useSelector(selectDbArtifacts);

  const { container } = useIntersectionObserver();

  const shouldCheckKeyword = keyword !== undefined && keyword.length >= 1;
  const lowerKeyword = keyword?.toLowerCase() ?? "";

  const setOptions = useMemo(() => {
    const options: EquippedSetOption[] = [];

    for (const character of characters) {
      if (!character.artifactIDs.length) {
        continue;
      }

      const appCharacter = getAppCharacter(character.code);

      const option: EquippedSetOption = {
        owner: {
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
    if (selection.characterCode === 0) {
      return;
    }

    const selectedItem = container.getItemById(selection.characterCode);

    if (selectedItem !== null && selectedItem.element.hidden) {
      setSelection({
        characterCode: 0,
        artifactId: 0,
      });
      onSelectArtifact(undefined);
    }
  }, [keyword]);

  return (
    <div ref={container.ref} className="pr-2 h-full custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 peer">
        {setOptions.map(({ owner, artifacts }) => {
          const viewed = container.isItemViewed(owner.code);
          const hidden = shouldCheckKeyword && !owner.name.toLowerCase().includes(lowerKeyword);

          return (
            <div
              key={owner.code}
              data-slot="set-option"
              className="break-inside-avoid relative group"
              hidden={hidden}
              {...container.itemAttributes(owner.code)}
            >
              <Button
                className="absolute top-3 right-3"
                variant={owner.code === selection.characterCode ? "primary" : "default"}
                size="small"
                onClick={() => onSelectSet(artifacts)}
              >
                Select
              </Button>

              <EquippedSet
                owner={owner}
                artifacts={artifacts}
                selectedArtifactId={selection.artifactId}
                viewed={viewed}
                onClickItem={(artifact) => {
                  setSelection({
                    characterCode: owner.code,
                    artifactId: artifact.ID,
                  });
                  onSelectArtifact(artifact);
                }}
              />
            </div>
          );
        })}
      </div>

      <p className="py-4 text-light-hint text-lg text-center peer-has-[>:not([hidden])]:hidden">
        No Loadouts found
      </p>
    </div>
  );
}
