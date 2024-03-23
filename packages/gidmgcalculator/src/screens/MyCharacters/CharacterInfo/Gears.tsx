import { useState } from "react";
import { useScreenWatcher, CloseButton, CarouselSpace } from "rond";

import type { ArtifactAttribute, UserArtifacts, UserWeapon } from "@Src/types";
import type { GearsDetailType } from "./CharacterInfo.types";
import { ARTIFACT_TYPES } from "@Src/constants";
import { Calculation_ } from "@Src/utils";

// Store
import { useDispatch } from "@Store/hooks";
import { switchArtifact, switchWeapon, unequipArtifact } from "@Store/userdb-slice";

// Component
import { WeaponInventory, ArtifactInventory } from "@Src/components";
import { GearsOverview } from "./GearsOverview";
import { GearsDetail } from "./GearsDetail";

interface GearsProps {
  weapon: UserWeapon;
  artifacts: UserArtifacts;
  artAttr: ArtifactAttribute;
}
export default function Gears(props: GearsProps) {
  const { weapon, artifacts } = props;
  const dispatch = useDispatch();
  const screenWatcher = useScreenWatcher();
  const setBonuses = Calculation_.getArtifactSetBonuses(artifacts);

  const [activeDetails, setActiveDetails] = useState<GearsDetailType>(-1);
  const [showingDetail, setShowingDetail] = useState(false);
  const [inventoryCode, setInventoryCode] = useState(-1);

  const isFromXmScreen = screenWatcher.isFromSize("xm");
  const hiddenSpaceWidth = "19rem";
  const currentChar = weapon.owner;

  const toggleDetails = (type: GearsDetailType) => {
    if (activeDetails === type) {
      setShowingDetail(false);
      setTimeout(() => setActiveDetails(-1), 200);
    } else {
      setShowingDetail(true);
      setActiveDetails(type);
    }
  };

  const overviewComponent = (
    <GearsOverview
      weapon={weapon}
      artifacts={artifacts}
      setBonuses={setBonuses}
      activeDetails={activeDetails}
      toggleDetails={toggleDetails}
      onClickEmptyArtIcon={setInventoryCode}
    />
  );

  const renderDetail = (className = "") => {
    if (activeDetails === -1) return null;

    return (
      <div className={`h-full ${className}`} style={{ width: isFromXmScreen ? hiddenSpaceWidth : undefined }}>
        <GearsDetail
          activeDetails={activeDetails}
          {...props}
          setBonuses={setBonuses}
          onClickSwitchWeapon={() => setInventoryCode(5)}
          onClickSwitchArtifact={() => {
            if (typeof activeDetails === "number") {
              setInventoryCode(activeDetails);
            }
          }}
          onClickUnequipArtifact={() => {
            if (typeof activeDetails === "number") {
              const activeArtifact = artifacts[activeDetails];

              if (activeArtifact) {
                setShowingDetail(false);
                setTimeout(() => {
                  setActiveDetails(-1);
                  dispatch(
                    unequipArtifact({
                      owner: activeArtifact.owner,
                      artifactID: activeArtifact.ID,
                      artifactIndex: activeDetails,
                    })
                  );
                }, 200);
              }
            }
          }}
          onCloseDetails={() => toggleDetails(activeDetails)}
        />
      </div>
    );
  };

  return (
    <>
      {isFromXmScreen ? (
        <div className="h-full flex">
          <div className="w-75 px-4 rounded-lg bg-dark-900 box-content">{overviewComponent}</div>
          <div
            className="py-2 hide-scrollbar transition-size duration-200 ease-in-out"
            style={{ width: showingDetail ? hiddenSpaceWidth : 0 }}
          >
            {renderDetail("p-4 border-l-2 border-dark-700 rounded-r-lg bg-dark-900")}
          </div>
        </div>
      ) : (
        <div className="w-75 h-full px-4 shrink-0 rounded-lg bg-dark-900 box-content">
          <CarouselSpace current={showingDetail ? 1 : 0}>
            {overviewComponent}
            <div className="h-full py-4 flex flex-col">
              <div className="flex justify-center">
                <CloseButton size="small" onClick={() => toggleDetails(activeDetails)} />
              </div>
              <div className="mt-4 grow hide-scrollbar">{renderDetail()}</div>
            </div>
          </CarouselSpace>
        </div>
      )}

      <WeaponInventory
        active={inventoryCode === 5}
        owner={currentChar}
        weaponType={weapon.type}
        buttonText="Switch"
        onClickButton={(selectedWeapon) => {
          if (currentChar) {
            dispatch(
              switchWeapon({
                newOwner: selectedWeapon.owner,
                newID: selectedWeapon.ID,
                oldOwner: currentChar,
                oldID: weapon.ID,
              })
            );
          }
        }}
        onClose={() => setInventoryCode(-1)}
      />

      <ArtifactInventory
        active={inventoryCode >= 0 && inventoryCode < 5}
        currentArtifacts={artifacts}
        forcedType={ARTIFACT_TYPES[inventoryCode]}
        owner={currentChar}
        buttonText="Switch"
        onClickButton={(selectedArtifact) => {
          if (currentChar) {
            dispatch(
              switchArtifact({
                newOwner: selectedArtifact.owner,
                newID: selectedArtifact.ID,
                oldOwner: currentChar,
                oldID: artifacts[inventoryCode]?.ID || 0,
                artifactIndex: inventoryCode,
              })
            );
          }
        }}
        onClose={() => setInventoryCode(-1)}
      />
    </>
  );
}
