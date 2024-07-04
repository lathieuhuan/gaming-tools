import { useEffect, useState } from "react";
import { ItemCase } from "rond";
import { ARTIFACT_TYPES, AppWeapon, TotalAttribute } from "@Backend";

import type { Character, SimulationMember } from "@Src/types";
import type { ActiveMember } from "@Simulator/ToolboxProvider";
import { $AppArtifact } from "@Src/services";
import { Utils_ } from "@Src/utils";
import { ArtifactCard, AttributeTable, GenshinImage, ItemThumbnail, TalentList, WeaponCard } from "@Src/components";

export function AttributesTab({ member }: { member: ActiveMember }) {
  const [totalAttr, setTotalAttr] = useState<TotalAttribute | null>(null);

  useEffect(() => {
    if (member) {
      const { initialTotalAttr, unsubscribe } = member.tools.subscribeTotalAttr(setTotalAttr);

      setTotalAttr(initialTotalAttr);
      return unsubscribe;
    }
    return undefined;
  }, [member]);

  return totalAttr ? <AttributeTable attributes={totalAttr} /> : null;
}

interface GreasTabProps {
  weapon: SimulationMember["weapon"];
  appWeapon: AppWeapon;
  artifacts: SimulationMember["artifacts"];
}
export function GreasTab({ weapon, appWeapon, artifacts }: GreasTabProps) {
  const [detailIndex, setDetailIndex] = useState(-1);

  const selectedArtifact = artifacts[detailIndex];

  return (
    <div>
      <div className="flex flex-wrap">
        <div className="p-1 w-1/3">
          <ItemCase chosen={detailIndex === -1} onClick={() => setDetailIndex(-1)}>
            {(className, imgCls) => (
              <ItemThumbnail
                className={className}
                imgCls={imgCls}
                item={{
                  beta: appWeapon.beta,
                  icon: appWeapon.icon,
                  rarity: appWeapon.rarity,
                  ...weapon,
                  owner: undefined,
                }}
              />
            )}
          </ItemCase>
        </div>

        {artifacts.map((artifact, i) => {
          return artifact ? (
            <div key={i} className="p-1 w-1/3">
              <ItemCase chosen={detailIndex === i} onClick={() => setDetailIndex(i)}>
                {(className) => (
                  <ItemThumbnail
                    className={className}
                    item={{
                      rarity: artifact.rarity,
                      level: artifact.level,
                      icon: $AppArtifact.get(artifact)?.icon || "",
                    }}
                  />
                )}
              </ItemCase>
            </div>
          ) : (
            <div key={i} className="p-1 w-1/3" style={{ minHeight: 124 }}>
              <div className="p-4 w-full h-full flex-center rounded bg-surface-3">
                <GenshinImage className="w-full" src={Utils_.artifactIconOf(ARTIFACT_TYPES[i])} />
              </div>
            </div>
          );
        })}
      </div>

      {detailIndex === -1 ? (
        <WeaponCard weapon={weapon} mutable={false} withGutter={false} />
      ) : (
        <ArtifactCard artifact={artifacts[detailIndex] ?? undefined} mutable={false} withGutter={false} />
      )}
    </div>
  );
}

export function TalentsTab({ char }: { char: Character }) {
  return <TalentList char={char} />;
}
