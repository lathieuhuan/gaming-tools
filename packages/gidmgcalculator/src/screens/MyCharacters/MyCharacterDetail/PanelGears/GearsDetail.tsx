import { useEffect } from "react";
import { Button, FancyBackSvg } from "rond";
import { AttributeStat } from "@Backend";

import type { GearsDetailType } from "./Gears.types";
import { useDispatch } from "@Store/hooks";
import { updateUserArtifactSubStat, updateUserArtifact, updateUserWeapon, unequipArtifact } from "@Store/userdb-slice";
import { AttributeTable, SetBonusesView, ArtifactCard, WeaponCard } from "@Src/components";
import { useMyCharacterDetailInfo } from "../MyCharacterDetailInfoProvider";
import { useMyCharacterDetailModalsCtrl } from "../MyCharacterDetailModalsProvider";

export interface GearsDetailProps {
  detailType: GearsDetailType;
  showCloseBtn?: boolean;
  onClose: () => void;
}
export function GearsDetail({ detailType, showCloseBtn, onClose }: GearsDetailProps) {
  const dispatch = useDispatch();
  const { data } = useMyCharacterDetailInfo();
  const modalCtrl = useMyCharacterDetailModalsCtrl();

  const closeBtnProps = {
    icon: <FancyBackSvg />,
    className: !showCloseBtn && "hidden",
    onClick: onClose,
  };

  useEffect(() => {
    if (
      !data ||
      (typeof detailType === "number" && detailType >= 0 && detailType < 5 && !data.artifacts[detailType]) ||
      (detailType === "setBonus" && !data.setBonuses.length)
    ) {
      onClose();
    }
  }, [detailType, data]);

  if (!data) return null;

  switch (detailType) {
    case "weapon": {
      const { weapon } = data;
      return (
        <WeaponCard
          wrapperCls="h-full"
          mutable
          withGutter={false}
          weapon={weapon}
          upgrade={(level) => dispatch(updateUserWeapon({ ID: weapon.ID, level }))}
          refine={(refi) => dispatch(updateUserWeapon({ ID: weapon.ID, refi }))}
          actions={[
            closeBtnProps,
            {
              children: "Switch",
              variant: "primary",
              onClick: modalCtrl.requestSwitchWeapon,
            },
          ]}
        />
      );
    }
    case "setBonus":
      return (
        <div className="h-full flex flex-col">
          <div className="grow pr-1 hide-scrollbar">
            <SetBonusesView setBonuses={data.setBonuses} />
          </div>
          <div className={`mt-3 flex justify-center ${closeBtnProps.className}`}>
            <Button {...closeBtnProps} />
          </div>
        </div>
      );

    case "statsBonus":
      return (
        <div className="h-full flex flex-col">
          <div className="grow hide-scrollbar">
            <AttributeTable attributes={data.artAttr} />
          </div>
          <div className={`mt-3 flex justify-center ${closeBtnProps.className}`}>
            <Button {...closeBtnProps} />
          </div>
        </div>
      );

    default: {
      const activeArtifact = data.artifacts[detailType];

      if (detailType !== -1 && activeArtifact) {
        return (
          <ArtifactCard
            wrapperCls="h-full"
            withGutter={false}
            artifact={activeArtifact}
            mutable
            onEnhance={(level) => {
              dispatch(updateUserArtifact({ ID: activeArtifact.ID, level }));
            }}
            onChangeMainStatType={(type) => {
              dispatch(
                updateUserArtifact({
                  ID: activeArtifact.ID,
                  mainStatType: type as AttributeStat,
                })
              );
            }}
            onChangeSubStat={(subStatIndex, changes) => {
              dispatch(updateUserArtifactSubStat({ ID: activeArtifact.ID, subStatIndex, ...changes }));
            }}
            actions={[
              closeBtnProps,
              {
                children: "Unequip",
                onClick: () => {
                  onClose();

                  setTimeout(() => {
                    dispatch(
                      unequipArtifact({
                        owner: activeArtifact.owner,
                        artifactID: activeArtifact.ID,
                        artifactIndex: detailType,
                      })
                    );
                  }, 200);
                },
              },
              { children: "Switch", variant: "primary", onClick: () => modalCtrl.requestSwitchArtifact(detailType) },
            ]}
          />
        );
      }
      return null;
    }
  }
}
