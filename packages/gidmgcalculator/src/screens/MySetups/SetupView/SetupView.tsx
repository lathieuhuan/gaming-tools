import { ARTIFACT_TYPES, CalcTeamData } from "@Calculation";
import { useMemo, useState } from "react";
import { FaPlus, FaShareAlt, FaUnlink, FaWrench } from "react-icons/fa";
import { Button, ButtonGroup, CloseButton, clsx, Modal, TrashCanSvg } from "rond";

import type { Teammate, UserArtifacts, UserComplexSetup, UserSetup, UserWeapon } from "@/types";
import type { OpenModalFn } from "../types";

import { $AppArtifact, $AppCharacter, $AppWeapon } from "@/services";
import Entity_ from "@/utils/entity-utils";
import { useDispatch } from "@Store/hooks";
import { chooseUserSetup, switchShownSetupInComplex, uncombineSetups } from "@Store/userdb-slice";

// Component
import { CharacterPortrait, GenshinImage } from "@/components";
import { GearIcon } from "./GearIcon";
import { TeammateDetail } from "./TeammateDetail";

type SetupViewProps = {
  setup: UserSetup;
  complexSetup?: UserComplexSetup;
  teamData: CalcTeamData;
  weapon: UserWeapon;
  artifacts?: UserArtifacts;
  onEditSetup: () => void;
  onCalcTeammateSetup: (teammateIndex: number) => void;
  openModal: OpenModalFn;
};

export function SetupView({
  setup,
  complexSetup,
  teamData,
  weapon,
  artifacts = [],
  onEditSetup,
  onCalcTeammateSetup,
  openModal,
}: SetupViewProps) {
  const dispatch = useDispatch();
  const { type, char, party } = setup;
  const { allIDs } = complexSetup || {};

  const [teammateDetail, setTeammateDetail] = useState({
    index: -1,
    calculated: false,
  });

  const teammate = party[teammateDetail.index];
  const isOriginal = type === "original";
  const isFetched = $AppCharacter.getStatus(char.name) === "fetched";

  const closeTeammateDetail = () => {
    setTeammateDetail({
      index: -1,
      calculated: false,
    });
  };

  const uncombine = () => {
    if (complexSetup) {
      dispatch(uncombineSetups(complexSetup.ID));

      setTimeout(() => {
        dispatch(chooseUserSetup(setup.ID));
      }, 10);
    }
  };

  const handleSwitchTeammate = (teammate: Teammate) => {
    const shownId = allIDs ? allIDs[teammate.name] : undefined;

    if (complexSetup && shownId) {
      dispatch(
        switchShownSetupInComplex({
          complexID: complexSetup.ID,
          shownID: shownId,
        })
      );
      closeTeammateDetail();
    }
  };

  const display = useMemo(() => {
    let mainCharacter = null;
    const appCharacter = teamData.getAppMember(char.name);
    const appWeapon = $AppWeapon.get(weapon.code);

    if (appCharacter) {
      const talents = (["NAs", "ES", "EB"] as const).map((talentType) => {
        return teamData.getFinalTalentLv(talentType);
      });

      const renderSpan = (text: string | number) => (
        <span className={`font-medium text-${appCharacter.vision}`}>{text}</span>
      );

      mainCharacter = (
        <div className="flex">
          <GenshinImage className="w-20 h-20" src={appCharacter.icon} imgType="character" />

          <div className="ml-4 flex-col justify-between">
            <p className="text-lg">Level {renderSpan(char.level)}</p>
            <p>Constellation {renderSpan(char.cons)}</p>
            <p>
              Talents: {renderSpan(talents[0])} / {renderSpan(talents[1])} / {renderSpan(talents[2])}
            </p>
          </div>
        </div>
      );
    }

    const teammates = (
      <div className="flex space-x-4">
        {[0, 1, 2].map((teammateIndex) => {
          const teammate = party[teammateIndex];

          if (teammate) {
            const teammateData = $AppCharacter.get(teammate.name);
            const calculated = !isOriginal && !!allIDs?.[teammate.name];

            return (
              <CharacterPortrait
                key={teammateIndex}
                className={clsx("cursor-pointer", calculated && "shadow-3px-3px shadow-primary-1")}
                info={teammateData}
                onClick={() => {
                  setTeammateDetail({
                    index: teammateIndex,
                    calculated,
                  });
                }}
              />
            );
          }
          return <CharacterPortrait key={teammateIndex} />;
        })}
      </div>
    );

    const gears = (
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-2">
          {appWeapon ? (
            <GearIcon item={appWeapon} disabled={!isFetched} onClick={openModal("WEAPON")} />
          ) : (
            <GearIcon item={{ icon: "7/7b/Icon_Inventory_Weapons" }} />
          )}

          {artifacts.map((artifact, i) => {
            if (artifact) {
              const appArtifact = $AppArtifact.get(artifact);

              return appArtifact ? (
                <GearIcon
                  key={i}
                  item={{
                    icon: appArtifact.icon,
                    beta: appArtifact.beta,
                    rarity: artifact.rarity || 5,
                  }}
                  disabled={!isFetched}
                  onClick={openModal("ARTIFACTS")}
                />
              ) : null;
            }

            return <GearIcon key={i} item={{ icon: Entity_.artifactIconOf(ARTIFACT_TYPES[i]) || "" }} />;
          })}
        </div>
      </div>
    );

    return {
      mainCharacter,
      teammates,
      gears,
    };
  }, [complexSetup?.ID, setup.ID, isFetched]);

  return (
    <>
      <div className="pr-1 flex justify-between flex-col lg:flex-row" onDoubleClick={() => console.log(setup)}>
        <div className="flex items-center">
          {!isOriginal && (
            <Button variant="custom" className="text-danger-2" boneOnly icon={<FaUnlink />} onClick={uncombine} />
          )}
          <p className="px-1 text-xl text-heading-color font-semibold truncate">{complexSetup?.name || setup.name}</p>
        </div>

        <div className="mt-2 lg:mt-0 pb-2 flex space-x-3 justify-end">
          <Button icon={<FaWrench />} onClick={onEditSetup} />

          <Button icon={<FaShareAlt />} onClick={openModal("SHARE_SETUP")} />

          {isOriginal ? (
            <Button icon={<TrashCanSvg />} onClick={openModal("REMOVE_SETUP")} />
          ) : (
            <Button
              icon={<FaPlus />}
              disabled={!allIDs || Object.keys(allIDs).length >= 4}
              onClick={openModal("COMBINE_MORE")}
            />
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-3 rounded-lg bg-surface-1 flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col gap-4">
          {display.mainCharacter}
          {display.teammates}
        </div>

        <div className="hidden lg:block w-0.5 bg-surface-3" />

        <div className="flex flex-col gap-4">
          <ButtonGroup
            justify="center"
            buttons={[
              {
                children: "Stats",
                variant: "custom",
                className: "bg-surface-3",
                disabled: !isFetched,
                onClick: openModal("STATS"),
              },
              {
                children: "Modifiers",
                variant: "custom",
                className: "bg-surface-3",
                disabled: !isFetched,
                onClick: openModal("MODIFIERS"),
              },
            ]}
          />

          {display.gears}
        </div>
      </div>

      <Modal.Core
        active={teammateDetail.index !== -1}
        className="rounded-lg shadow-white-glow"
        onClose={closeTeammateDetail}
      >
        <CloseButton className={Modal.CLOSE_BTN_CLS} boneOnly onClick={closeTeammateDetail} />

        {teammate && (
          <TeammateDetail
            teammate={teammate}
            calculated={teammateDetail.calculated}
            onSwitch={() => handleSwitchTeammate(teammate)}
            onCalculate={() => onCalcTeammateSetup(teammateDetail.index)}
          />
        )}
      </Modal.Core>
    </>
  );
}
