import { useEffect, useState } from "react";
import { FaSyncAlt, FaUserSlash } from "react-icons/fa";
import { clsx, message, CollapseSpace } from "rond";

import Array_ from "@Src/utils/array-utils";
import { useCharacterData, usePartyData } from "../../contexts";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectActiveId,
  selectSetupManageInfos,
  selectParty,
  addTeammate,
  removeTeammate,
  updateTeammateArtifact,
  updateTeammateWeapon,
} from "@Store/calculator-slice";

// Component
import { TeammateItems, Tavern, WeaponForge, ArtifactForge, CharacterPortrait } from "@Src/components";
import { CopySelect } from "./CopySelect";

import styles from "../SetupManager.styles.module.scss";

interface ModalState {
  type: "CHARACTER" | "WEAPON" | "ARTIFACT" | "";
  teammateIndex: number | null;
}

export default function SectionParty() {
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveId);
  const setupManageInfos = useSelector(selectSetupManageInfos);
  const party = useSelector(selectParty);
  const appChar = useCharacterData();
  const partyData = usePartyData();

  const [modal, setModal] = useState<ModalState>({
    type: "",
    teammateIndex: null,
  });
  const [detailSlot, setDetailSlot] = useState<number | null>(null);

  const isCombined = Array_.findById(setupManageInfos, activeId)?.type === "combined";
  const detailTeammate = detailSlot === null ? undefined : party[detailSlot];

  useEffect(() => {
    if (!detailTeammate) {
      setDetailSlot(null);
    }
  }, [detailTeammate]);

  const closeModal = () => {
    setModal({ type: "", teammateIndex: null });
  };

  const warnSetupCombined = () => {
    message.info("This setup is marked as part of a Complex setup, thus teammates cannot be changed.");
  };

  const onClickChangeTeammate = (teammateIndex: number) => {
    if (isCombined) {
      warnSetupCombined();
    } else {
      setModal({
        type: "CHARACTER",
        teammateIndex,
      });
    }
  };

  const onClickRemoveTeammate = () => {
    if (isCombined) {
      warnSetupCombined();
    } else if (detailSlot !== null) {
      dispatch(removeTeammate(detailSlot));
    }
  };

  return (
    <div className={"pb-3 bg-surface-2 " + styles.section}>
      {party.length && party.every((teammate) => !teammate) ? <CopySelect /> : null}

      <div className="flex">
        {partyData.map((data, teammateIndex) => {
          const isExpanded = teammateIndex === detailSlot;

          return (
            <div key={teammateIndex} className="w-1/3 flex flex-col items-center" style={{ height: "5.25rem" }}>
              <div
                className={clsx(
                  "flex items-end text-xl shrink-0 overflow-hidden transition-size",
                  isExpanded ? "h-11" : "h-3"
                )}
              >
                <button
                  className={"w-10 h-10 glow-on-hover " + (isExpanded ? "flex-center" : "hidden")}
                  onClick={onClickRemoveTeammate}
                >
                  <FaUserSlash />
                </button>
                <button
                  className={"w-10 h-10 glow-on-hover " + (isExpanded ? "flex-center" : "hidden")}
                  onClick={() => onClickChangeTeammate(teammateIndex)}
                >
                  <FaSyncAlt />
                </button>
              </div>

              <CharacterPortrait
                info={data ?? undefined}
                withColorBg
                recruitable
                onClick={() => {
                  if (data) {
                    setDetailSlot(isExpanded ? null : teammateIndex);
                    return;
                  }
                  onClickChangeTeammate(teammateIndex);
                }}
              />
            </div>
          );
        })}
      </div>

      <CollapseSpace active={detailSlot !== null}>
        {detailTeammate && (
          <div className="bg-surface-2 pt-2">
            <TeammateItems
              mutable
              className="bg-surface-1 pt-12 px-2 pb-3"
              teammate={detailTeammate}
              onClickWeapon={() => setModal({ type: "WEAPON", teammateIndex: detailSlot })}
              onChangeWeaponRefinement={(refi: number) => {
                if (detailSlot !== null) {
                  dispatch(
                    updateTeammateWeapon({
                      teammateIndex: detailSlot,
                      refi,
                    })
                  );
                }
              }}
              onClickArtifact={() => setModal({ type: "ARTIFACT", teammateIndex: detailSlot })}
              onClickRemoveArtifact={() => {
                if (detailSlot !== null) {
                  dispatch(
                    updateTeammateArtifact({
                      teammateIndex: detailSlot,
                      code: -1,
                    })
                  );
                }
              }}
            />
          </div>
        )}
      </CollapseSpace>

      <Tavern
        active={modal.type === "CHARACTER" && modal.teammateIndex !== null}
        sourceType="app"
        filter={(character) => character.name !== appChar.name && party.every((tm) => tm?.name !== character.name)}
        onSelectCharacter={(character) => {
          const { teammateIndex } = modal;

          if (teammateIndex !== null) {
            dispatch(
              addTeammate({
                name: character.name,
                elementType: character.vision,
                weaponType: character.weaponType,
                teammateIndex,
              })
            );
            setDetailSlot(teammateIndex);
          }
        }}
        onClose={closeModal}
      />

      {detailSlot !== null && (
        <WeaponForge
          active={modal.type === "WEAPON" && modal.teammateIndex !== null}
          forcedType={partyData[detailSlot]?.weaponType}
          onForgeWeapon={(weapon) => {
            dispatch(
              updateTeammateWeapon({
                teammateIndex: detailSlot,
                code: weapon.code,
              })
            );
          }}
          onClose={closeModal}
        />
      )}

      {detailSlot !== null && (
        <ArtifactForge
          active={modal.type === "ARTIFACT" && modal.teammateIndex !== null}
          forcedType="flower"
          forFeature="TEAMMATE_MODIFIERS"
          onForgeArtifact={(artifact) => {
            dispatch(
              updateTeammateArtifact({
                teammateIndex: detailSlot,
                code: artifact.code,
              })
            );
          }}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
