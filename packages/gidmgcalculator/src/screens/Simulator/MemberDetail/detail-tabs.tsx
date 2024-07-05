import { useEffect, useState } from "react";
import { ItemCase } from "rond";
import { ARTIFACT_TYPES, AppWeapon, GeneralCalc, TotalAttribute } from "@Backend";

import type { Character, SimulationMember } from "@Src/types";
import type { ActiveMember } from "@Simulator/ToolboxProvider";
import { $AppArtifact } from "@Src/services";
import { Utils_ } from "@Src/utils";
import {
  ArtifactCard,
  AttributeTable,
  GenshinImage,
  ItemThumbnail,
  SetBonusesView,
  TalentList,
  WeaponCard,
} from "@Src/components";

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

  const onClickItem = (index: number) => {
    setDetailIndex(index === detailIndex ? -1 : index);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap">
        <div className="p-1.5 w-1/3">
          <ItemCase chosen={detailIndex === 5} onClick={() => onClickItem(5)}>
            {(className, imgCls) => (
              <ItemThumbnail
                className={className}
                imgCls={imgCls}
                compact
                title={appWeapon.name}
                item={{
                  beta: appWeapon.beta,
                  icon: appWeapon.icon,
                  rarity: appWeapon.rarity,
                  ...weapon,
                }}
              />
            )}
          </ItemCase>
        </div>

        {artifacts.map((artifact, i) => {
          const appArtifactSet = artifact ? $AppArtifact.getSet(artifact.code) : undefined;

          if (artifact && appArtifactSet) {
            return (
              <div key={i} className="p-1.5 w-1/3">
                <ItemCase chosen={detailIndex === i} onClick={() => onClickItem(i)}>
                  {(className, imgCls) => (
                    <ItemThumbnail
                      className={className}
                      imgCls={imgCls}
                      title={appArtifactSet.name}
                      compact
                      item={{
                        rarity: artifact.rarity,
                        level: artifact.level,
                        icon: appArtifactSet[artifact.type].icon,
                      }}
                    />
                  )}
                </ItemCase>
              </div>
            );
          }

          return (
            <div key={i} className="p-1.5 w-1/3" style={{ minHeight: 124 }}>
              <div className="p-4 w-full h-full flex-center rounded bg-surface-3">
                <GenshinImage className="w-full" src={Utils_.artifactIconOf(ARTIFACT_TYPES[i])} />
              </div>
            </div>
          );
        })}
      </div>

      {detailIndex === 5 ? (
        <WeaponCard weapon={weapon} mutable={false} withGutter={false} />
      ) : detailIndex >= 0 ? (
        <ArtifactCard artifact={artifacts[detailIndex] ?? undefined} mutable={false} withGutter={false} />
      ) : (
        <SetBonusesView noTitle setBonuses={GeneralCalc.getArtifactSetBonuses(artifacts)} />
      )}
    </div>
  );
}

export function TalentsTab({ char }: { char: Character }) {
  return <TalentList char={char} />;
}
