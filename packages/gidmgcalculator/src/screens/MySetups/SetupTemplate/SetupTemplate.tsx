import { useMemo, useState } from "react";
import { FaLink, FaPlus, FaShareAlt, FaTrashAlt, FaUnlink, FaWrench } from "react-icons/fa";
import { clsx, useScreenWatcher, Button, ButtonGroup, Modal, CloseButton } from "rond";

import type { UserArtifacts, UserSetup, UserWeapon } from "@Src/types";
import type { OpenModalFn } from "../MySetups.types";
import { ARTIFACT_TYPES } from "@Src/constants";
import { $AppCharacter, $AppData } from "@Src/services";
import { Artifact_, Character_, Setup_ } from "@Src/utils";

// Store
import { useDispatch } from "@Store/hooks";
import { updateSetupImportInfo } from "@Store/ui-slice";
import { makeTeammateSetup } from "@Store/thunks";
import { chooseUserSetup, switchShownSetupInComplex, uncombineSetups } from "@Store/userdb-slice";

// Component
import { CharacterPortrait, WikiImage } from "@Src/components";
import { TeammateDetail } from "./TeammateDetail";
import { GearIcon } from "./GearIcon";

interface SetupLayoutProps {
  ID: number;
  setup: UserSetup;
  setupName?: string;
  weapon: UserWeapon | null;
  artifacts?: UserArtifacts;
  allIDs?: Record<string, number>;
  openModal: OpenModalFn;
}
export function SetupTemplate({ ID, setup, setupName, weapon, artifacts = [], allIDs, openModal }: SetupLayoutProps) {
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const { type, char, party } = setup;

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
    dispatch(uncombineSetups(ID));

    setTimeout(() => {
      dispatch(chooseUserSetup(setup.ID));
    }, 10);
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
    const appWeapon = weapon ? $AppData.getWeapon(weapon.code) : undefined;

    if (appChar) {
      const talents = (["NAs", "ES", "EB"] as const).map((talentType) => {
        return Character_.getFinalTalentLv({
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
          <WikiImage className="w-20 h-20" src={appChar.icon} imgType="character" />

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

    const teammate = party.filter(Boolean).length ? (
      <div className="flex space-x-4">
        {party.map((teammate, teammateIndex) => {
          const dataTeammate = teammate && $AppCharacter.get(teammate.name);
          if (!dataTeammate) return null;

          const isCalculated = !isOriginal && !!allIDs?.[teammate.name];

          return (
            <div
              key={teammateIndex}
              className={clsx(
                "w-18 h-18 cursor-pointer",
                isCalculated && " rounded-circle shadow-3px-3px shadow-yellow-400 cursor-pointer"
              )}
            >
              <CharacterPortrait
                code={dataTeammate.code}
                icon={dataTeammate.icon}
                onClickIcon={() => {
                  setTeammateDetail({
                    index: teammateIndex,
                    isCalculated,
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    ) : null;

    const gears = (
      <div className="grid grid-cols-3 gap-2">
        {appWeapon ? (
          <GearIcon item={appWeapon} disabled={!isFetched} onClick={openModal("WEAPON")} />
        ) : (
          <GearIcon item={{ icon: "7/7b/Icon_Inventory_Weapons" }} />
        )}

        {artifacts.map((artifact, i) => {
          if (artifact) {
            const appArtifact = $AppData.getArtifact(artifact);

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

          return <GearIcon key={i} item={{ icon: Artifact_.iconOf(ARTIFACT_TYPES[i]) || "" }} />;
        })}
      </div>
    );

    return { mainCharacter, teammate, gears };
  }, [`${ID}-${setup.ID}`, isFetched]);

  return (
    <>
      <div className="pr-1 flex justify-between flex-col lg:flex-row" onDoubleClick={() => console.log(setup)}>
        <div className="flex items-center">
          {isOriginal ? null : screenWatcher.isFromSize("lg") ? (
            <Button
              className="hover:text-red-200 group shadow-none"
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
            <Button variant="custom" className="text-red-200" boneOnly icon={<FaUnlink />} onClick={uncombine} />
          )}
          <p className="px-1 text-xl text-orange-500 font-semibold truncate">{setupName || setup.name}</p>
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

      <div className="px-4 pt-4 pb-3 rounded-lg bg-dark-900 flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col gap-4">
          {display.mainCharacter}
          {display.teammate}
        </div>

        <div className="hidden lg:block w-0.5 bg-dark-500" />

        <div className="flex flex-col gap-4">
          <ButtonGroup
            justify="start"
            buttons={[
              {
                children: "Stats",
                variant: "custom",
                className: "bg-dark-500",
                disabled: !isFetched,
                onClick: openModal("STATS"),
              },
              {
                children: "Modifiers",
                variant: "custom",
                className: "bg-dark-500",
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
        <CloseButton onClick={closeTeammateDetail} />

        {teammateInfo && (
          <TeammateDetail
            teammate={teammateInfo}
            isCalculated={teammateDetail.isCalculated}
            onSwitchSetup={() => {
              const { name } = teammateInfo || {};
              const shownID = allIDs && name ? allIDs[name] : undefined;

              if (shownID) {
                dispatch(
                  switchShownSetupInComplex({
                    complexID: ID,
                    shownID,
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
