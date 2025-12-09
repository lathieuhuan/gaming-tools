import { useEffect } from "react";
import { Button, FancyBackSvg } from "rond";

import type { ArtifactType, AttributeStat } from "@/types";
import type { GearsDetailType } from "./Gears.types";

import { ArtifactCard, AttributeTable, SetBonusesView, WeaponCard } from "@/components";
import { ARTIFACT_TYPES } from "@/constants";
import { useDispatch } from "@Store/hooks";
import {
  unequipArtifact,
  updateUserArtifact,
  updateUserArtifactSubStat,
  updateUserWeapon,
} from "@Store/userdb-slice";
import { useActiveChar, useActiveCharActions } from "../ActiveCharProvider";

export type GearsDetailProps = {
  detailType: GearsDetailType;
  showCloseBtn?: boolean;
  onClose: () => void;
};

export function GearsDetail({ detailType, showCloseBtn, onClose }: GearsDetailProps) {
  const dispatch = useDispatch();
  const character = useActiveChar();
  const actions = useActiveCharActions();

  const { weapon, atfGear } = character;

  const closeBtnProps = {
    icon: <FancyBackSvg />,
    className: !showCloseBtn && "hidden",
    onClick: onClose,
  };

  useEffect(() => {
    const isArtifactType = (type: string): type is ArtifactType => {
      return ARTIFACT_TYPES.includes(type as ArtifactType);
    };

    if (
      (isArtifactType(detailType) && !atfGear.pieces[detailType]) ||
      (detailType === "setBonus" && !atfGear.sets.length)
    ) {
      onClose();
    }
  }, [detailType, character]);

  switch (detailType) {
    case "weapon": {
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
              onClick: actions.requestSwitchWeapon,
            },
          ]}
        />
      );
    }
    case "setBonus":
      return (
        <div className="h-full flex flex-col">
          <div className="grow pr-1 hide-scrollbar">
            <SetBonusesView sets={atfGear.sets} />
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
            <AttributeTable attributes={atfGear.finalAttrs} />
          </div>
          <div className={`mt-3 flex justify-center ${closeBtnProps.className}`}>
            <Button {...closeBtnProps} />
          </div>
        </div>
      );

    case "":
      return null;

    default: {
      const activeArtifact = atfGear.pieces[detailType];

      if (!activeArtifact) {
        return null;
      }

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
            dispatch(
              updateUserArtifactSubStat({ ID: activeArtifact.ID, subStatIndex, ...changes })
            );
          }}
          actions={[
            closeBtnProps,
            {
              children: "Unequip",
              onClick: () => {
                onClose();

                setTimeout(() => {
                  dispatch(unequipArtifact(activeArtifact.ID));
                }, 200);
              },
            },
            {
              children: "Switch",
              variant: "primary",
              onClick: () => {
                actions.requestSwitchArtifact({
                  isFilled: true,
                  type: detailType,
                  piece: activeArtifact,
                });
              },
            },
          ]}
        />
      );
    }
  }
}
