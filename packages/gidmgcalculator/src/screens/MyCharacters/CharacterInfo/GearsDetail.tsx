import { useEffect } from "react";

import type { ArtifactAttribute, AttributeStat, ArtifactSetBonus, UserArtifacts, UserWeapon } from "@Src/types";
import type { GearsDetailType } from "./CharacterInfo.types";
import { useDispatch } from "@Store/hooks";
import { updateUserArtifactSubStat, updateUserArtifact, updateUserWeapon } from "@Store/userdb-slice";
import { AttributeTable, SetBonusesView, ArtifactCard, WeaponCard } from "@Src/components";

interface GearsDetailProps {
  activeDetails: GearsDetailType;
  weapon: UserWeapon;
  artifacts: UserArtifacts;
  setBonuses: ArtifactSetBonus[];
  artAttr: ArtifactAttribute;
  onClickSwitchWeapon: () => void;
  onClickSwitchArtifact: () => void;
  onClickUnequipArtifact: () => void;
  onCloseDetails: () => void;
}
export function GearsDetail({
  activeDetails,
  weapon,
  artifacts,
  setBonuses,
  artAttr,
  onClickSwitchWeapon,
  onClickSwitchArtifact,
  onClickUnequipArtifact,
  onCloseDetails,
}: GearsDetailProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      (typeof activeDetails === "number" && activeDetails >= 0 && activeDetails < 5 && !artifacts[activeDetails]) ||
      (activeDetails === "setBonus" && !setBonuses.length)
    ) {
      onCloseDetails();
    }
  }, [activeDetails, weapon.owner]);

  switch (activeDetails) {
    case "weapon":
      return (
        <WeaponCard
          wrapperCls="h-full"
          mutable
          withGutter={false}
          weapon={weapon}
          upgrade={(level) => dispatch(updateUserWeapon({ ID: weapon.ID, level }))}
          refine={(refi) => dispatch(updateUserWeapon({ ID: weapon.ID, refi }))}
          actions={[
            {
              children: "Switch",
              variant: "primary",
              onClick: onClickSwitchWeapon,
            },
          ]}
        />
      );
    case "setBonus":
      return (
        <div className="pr-1 h-full hide-scrollbar">
          <SetBonusesView setBonuses={setBonuses} />
        </div>
      );

    case "statsBonus":
      return (
        <div className="h-full hide-scrollbar">
          <AttributeTable attributes={artAttr} />
        </div>
      );

    default: {
      const activeArtifact = artifacts[activeDetails];

      if (activeDetails !== -1 && activeArtifact) {
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
              { children: "Unequip", onClick: onClickUnequipArtifact },
              { children: "Switch", variant: "primary", onClick: onClickSwitchArtifact },
            ]}
          />
        );
      }
      return null;
    }
  }
}
