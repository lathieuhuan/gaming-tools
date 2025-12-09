import { memo, useState } from "react";
import { FaPlus, FaShareAlt, FaUnlink, FaWrench } from "react-icons/fa";
import { Button, ButtonGroup, CloseButton, Modal, TrashCanSvg } from "rond";

import type { CalcTeammate } from "@/models/calculator";
import type { SetupOverviewInfo } from "../types";

import { Artifact } from "@/models/base";
import { useDispatch } from "@Store/hooks";
import { MySetupsModalType, updateUI } from "@Store/ui-slice";
import { chooseUserSetup, switchShownSetupInComplex, uncombineSetups } from "@Store/userdb-slice";

// Component
import { CharacterPortrait, GenshinImage } from "@/components";
import { GearIcon } from "./GearIcon";
import { TeammateDetail } from "./TeammateDetail";

type SetupViewProps = SetupOverviewInfo & {
  onEditSetup: () => void;
  onCalcTeammateSetup: (teammateIndex: number) => void;
};

function SetupViewCore({ setup, complexSetup, onEditSetup, onCalcTeammateSetup }: SetupViewProps) {
  const dispatch = useDispatch();
  const { main, teammates } = setup;
  const { allIDs } = complexSetup || {};
  const { data: mainData, weapon, atfGear } = main;

  const [teammateDetail, setTeammateDetail] = useState({
    open: false,
    index: -1,
    calculated: false,
  });

  const mainColorText = `font-medium text-${mainData.vision}`;
  const selectedTeammate = teammates[teammateDetail.index];
  const isOriginalSetup = setup.type === "original";

  const openModal = (type: MySetupsModalType) => () => {
    dispatch(updateUI({ mySetupsModalType: type }));
  };

  const closeTeammateDetail = () => {
    setTeammateDetail({
      open: false,
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

  const handleSwitchTeammate = (teammate: CalcTeammate) => {
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

  return (
    <>
      <div
        className="pr-1 flex justify-between flex-col lg:flex-row"
        onDoubleClick={() => console.log({ main, teammates })}
      >
        <div className="flex items-center">
          {!isOriginalSetup && (
            <Button
              variant="custom"
              className="text-danger-2"
              boneOnly
              icon={<FaUnlink />}
              onClick={uncombine}
            />
          )}
          <p className="px-1 text-xl text-heading font-semibold truncate">
            {complexSetup?.name || setup.name}
          </p>
        </div>

        <div className="mt-2 lg:mt-0 pb-2 flex space-x-3 justify-end">
          <Button icon={<FaWrench />} onClick={onEditSetup} />

          <Button icon={<FaShareAlt />} onClick={openModal("SHARE_SETUP")} />

          {isOriginalSetup ? (
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

      <div className="px-4 pt-4 pb-3 rounded-lg bg-dark-1 flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex">
            <GenshinImage className="w-20 h-20" src={mainData.icon} imgType="character" />

            <div className="ml-4 flex-col justify-between">
              <p className="text-lg">
                Level <span className={mainColorText}>{main.level}</span>
              </p>
              <p>
                Constellation <span className={mainColorText}>{main.cons}</span>
              </p>
              <p>
                Talents: <span className={mainColorText}>{main.getFinalTalentLv("NAs")}</span> /{" "}
                <span className={mainColorText}>{main.getFinalTalentLv("ES")}</span> /{" "}
                <span className={mainColorText}>{main.getFinalTalentLv("EB")}</span>
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            {[0, 1, 2].map((teammateIndex) => {
              const teammate = teammates[teammateIndex];

              if (!teammate) {
                return <CharacterPortrait key={teammateIndex} />;
              }

              const calculated = !isOriginalSetup && !!allIDs?.[teammate.name];

              return (
                <CharacterPortrait
                  key={teammateIndex}
                  className={[
                    "cursor-pointer",
                    calculated && "shadow-hightlight-2 shadow-primary-1",
                  ]}
                  info={teammate.data}
                  onClick={() => {
                    setTeammateDetail({
                      open: true,
                      index: teammateIndex,
                      calculated,
                    });
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block w-0.5 bg-dark-3" />

        <div className="flex flex-col gap-4">
          <ButtonGroup
            justify="center"
            buttons={[
              {
                children: "Stats",
                variant: "custom",
                className: "bg-dark-3",
                onClick: openModal("STATS"),
              },
              {
                children: "Modifiers",
                variant: "custom",
                className: "bg-dark-3",
                onClick: openModal("MODIFIERS"),
              },
            ]}
          />

          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-2">
              <GearIcon item={weapon.data} onClick={openModal("WEAPON")} />

              {atfGear.slots.map((slot, i) => {
                if (!slot.isFilled) {
                  return <GearIcon key={i} item={{ icon: Artifact.iconOf(slot.type) }} />;
                }
                const { piece } = slot;

                return (
                  <GearIcon
                    key={i}
                    item={{
                      icon: piece.data[piece.type].icon,
                      beta: piece.data.beta,
                      rarity: piece.rarity || 5,
                    }}
                    onClick={openModal("ARTIFACTS")}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Modal.Core
        active={teammateDetail.open}
        className="rounded-lg shadow-popup"
        onClose={closeTeammateDetail}
      >
        <CloseButton className={Modal.CLOSE_BTN_CLS} boneOnly onClick={closeTeammateDetail} />

        {selectedTeammate && (
          <TeammateDetail
            teammate={selectedTeammate}
            calculated={teammateDetail.calculated}
            onSwitch={() => handleSwitchTeammate(selectedTeammate)}
            onCalculate={() => onCalcTeammateSetup(teammateDetail.index)}
          />
        )}
      </Modal.Core>
    </>
  );
}

export const SetupView = memo(SetupViewCore, (prev, next) => prev.setup.ID === next.setup.ID);
