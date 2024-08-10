import { useMemo, useState } from "react";
import { FaLink, FaPlus, FaShareAlt, FaTrashAlt, FaUnlink, FaWrench } from "react-icons/fa";
import { clsx, useScreenWatcher, Button, ButtonGroup, Modal, CloseButton } from "rond";
import { ARTIFACT_TYPES, CharacterCalc } from "@Backend";

import type { UserArtifacts, UserComplexSetup, UserSetup, UserWeapon } from "@Src/types";
import type { OpenModalFn } from "../MySetups.types";
import { $AppArtifact, $AppCharacter, $AppWeapon } from "@Src/services";
import { Utils_, Setup_ } from "@Src/utils";

// Store
import { useDispatch } from "@Store/hooks";
import { updateSetupImportInfo } from "@Store/ui-slice";
import { makeTeammateSetup } from "@Store/thunks";
import { chooseUserSetup, switchShownSetupInComplex, uncombineSetups } from "@Store/userdb-slice";

// Component
import { CharacterPortrait, GenshinImage } from "@Src/components";
import { TeammateDetail } from "./TeammateDetail";
import { GearIcon } from "./GearIcon";

interface SetupTemplateProps {
  setup: UserSetup;
  complexSetup?: UserComplexSetup;
  weapon: UserWeapon | null;
  artifacts?: UserArtifacts;
  openModal: OpenModalFn;
}
export function SetupTemplate({ setup, complexSetup, weapon, artifacts = [], openModal }: SetupTemplateProps) {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const { type, char, party } = setup;
  const { allIDs } = complexSetup || {};

  const [teammateDetail, setTeammateDetail] = useState({
    index: -1,
    isCalculated: false,
  });

  const teammateInfo = party[teammateDetail.index];
  const isOriginal = type === "original";
  const isFetched = $AppCharacter.getStatus(char.name) === "fetched";

  const closeTeammateDetail = () => {
    setTeammateDetail({
      index: -1,
      isCalculated: false,
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

  const onCalculateTeammateSetup = () => {
    if (weapon) {
      dispatch(
        makeTeammateSetup({
          setup,
          mainWeapon: weapon,
          teammateIndex: teammateDetail.index,
        })
      );
    }
  };

  const display = useMemo(() => {
    let mainCharacter = null;
    const appChar = $AppCharacter.get(char.name);
    const appWeapon = weapon ? $AppWeapon.get(weapon.code) : undefined;

    if (appChar) {
      const talents = (["NAs", "ES", "EB"] as const).map((talentType) => {
        return CharacterCalc.getFinalTalentLv({
          char,
          appChar,
          talentType,
          partyData: $AppCharacter.getPartyData(party),
        });
      });

      const renderSpan = (text: string | number) => (
        <span className={`font-medium text-${appChar.vision}`}>{text}</span>
      );

      mainCharacter = (
        <div className="flex">
          <GenshinImage className="w-20 h-20" src={appChar.icon} imgType="character" />

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
            const isCalculated = !isOriginal && !!allIDs?.[teammate.name];

            return (
              <CharacterPortrait
                key={teammateIndex}
                className={clsx("cursor-pointer", isCalculated && "shadow-3px-3px shadow-primary-1")}
                info={teammateData}
                onClick={() => {
                  setTeammateDetail({
                    index: teammateIndex,
                    isCalculated,
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

            return <GearIcon key={i} item={{ icon: Utils_.artifactIconOf(ARTIFACT_TYPES[i]) || "" }} />;
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
          {isOriginal ? null : screenWatcher.isFromSize("lg") ? (
            <Button
              className="hover:text-danger-2 group shadow-none"
              variant="custom"
              icon={
                <>
                  <FaUnlink className="hidden group-hover:block" />
                  <FaLink className="block group-hover:hidden" />
                </>
              }
              onClick={uncombine}
            />
          ) : (
            <Button variant="custom" className="text-danger-2" boneOnly icon={<FaUnlink />} onClick={uncombine} />
          )}
          <p className="px-1 text-xl text-heading-color font-semibold truncate">{complexSetup?.name || setup.name}</p>
        </div>

        <div className="mt-2 lg:mt-0 pb-2 flex space-x-3 justify-end">
          <Button
            icon={<FaWrench />}
            disabled={!weapon}
            onClick={() => {
              if (weapon) {
                const { ID, name, type, target } = setup;
                dispatch(
                  updateSetupImportInfo({
                    ID,
                    name,
                    type,
                    calcSetup: Setup_.userSetupToCalcSetup(setup, weapon, artifacts, true),
                    target,
                  })
                );
              }
            }}
          />

          <Button icon={<FaShareAlt />} onClick={openModal("SHARE_SETUP")} />

          {isOriginal ? (
            <Button icon={<FaTrashAlt />} onClick={openModal("REMOVE_SETUP")} />
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

        {teammateInfo && (
          <TeammateDetail
            teammate={teammateInfo}
            isCalculated={teammateDetail.isCalculated}
            onSwitchSetup={() => {
              const { name } = teammateInfo || {};
              const shownId = allIDs && name ? allIDs[name] : undefined;

              if (complexSetup && shownId) {
                dispatch(
                  switchShownSetupInComplex({
                    complexID: complexSetup.ID,
                    shownID: shownId,
                  })
                );
              }
            }}
            onCalculateTeammateSetup={onCalculateTeammateSetup}
          />
        )}
      </Modal.Core>
    </>
  );
}
