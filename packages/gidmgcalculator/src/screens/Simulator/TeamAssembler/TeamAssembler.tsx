import { useRef, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { Button, clsx, ConfirmModal } from "rond";

import type { ArtifactType } from "@/types";

import { useStore } from "@/lib/dynamic-store";
import { removeMember, switchArtifact, switchMember, switchWeapon } from "../actions/prepare";
import { selectSimulation, useSimulatorStore } from "../store";

import {
  ArtifactForge,
  ArtifactInventory,
  Tavern,
  WeaponForge,
  WeaponInventory,
} from "@/components";
import { GearSwitchSource, MemberConfig } from "./MemberConfig";

type ModalType =
  | "TAVERN"
  | "REMOVE_MEMBER"
  | "WEAPON_FORGE"
  | "WEAPON_INVENTORY"
  | "ARTIFACT_FORGE"
  | "ARTIFACT_INVENTORY"
  | "";

type TeamAssemblerProps = {
  className?: string;
};

export function TeamAssembler({ className }: TeamAssemblerProps) {
  const store = useStore();
  const { memberOrder, members } = useSimulatorStore(selectSimulation);

  const [modalType, setModalType] = useState<ModalType>("");
  const selected = useRef({
    index: -1,
    artifactType: undefined as ArtifactType | undefined,
  });

  const selectedMemberCode = memberOrder.at(selected.current.index);
  const selectedMember = selectedMemberCode ? members[selectedMemberCode] : undefined;
  const { data: selectedMemberData, atfGear } = selectedMember || {};

  const closeModal = () => setModalType("");

  const handleSwitchMember = (memberIndex: number) => {
    selected.current.index = memberIndex;
    setModalType("TAVERN");
  };

  const handleRemoveMember = (memberIndex: number) => {
    selected.current.index = memberIndex;
    setModalType("REMOVE_MEMBER");
  };

  const handleSwitchWeapon = (memberIndex: number) => (source: GearSwitchSource) => {
    selected.current.index = memberIndex;
    setModalType(source === "FORGE" ? "WEAPON_FORGE" : "WEAPON_INVENTORY");
  };

  const handleSwitchArtifact = (memberIndex: number) => {
    return (source: GearSwitchSource, type: ArtifactType) => {
      selected.current.index = memberIndex;
      selected.current.artifactType = type;
      setModalType(source === "FORGE" ? "ARTIFACT_FORGE" : "ARTIFACT_INVENTORY");
    };
  };

  const actionToSelectedMember = (action: (code: number) => void) => {
    if (selectedMemberCode) {
      action(selectedMemberCode);
    }
  };

  const SLOT_CLASSNAME = "w-84 h-full p-4 rounded-lg bg-dark-1 shrink-0";

  return (
    <>
      <div className={clsx("p-4 custom-scrollbar", className)}>
        <div className="h-full pb-2 custom-scrollbar flex gap-2">
          {Array.from({ length: 4 }, (_, slotIndex) => {
            const memberCode = memberOrder.at(slotIndex);

            if (memberCode && memberCode in members) {
              const member = members[memberCode];

              return (
                <MemberConfig
                  key={slotIndex}
                  className={SLOT_CLASSNAME}
                  character={member}
                  onSwitchMember={() => handleSwitchMember(slotIndex)}
                  onRemoveMember={() => handleRemoveMember(slotIndex)}
                  onSwitchWeapon={handleSwitchWeapon(slotIndex)}
                  onSwitchArtifact={handleSwitchArtifact(slotIndex)}
                />
              );
            }

            const canAddMember = !slotIndex || memberOrder.at(slotIndex - 1) !== undefined;

            return (
              <div key={slotIndex} className={SLOT_CLASSNAME}>
                {canAddMember && (
                  <div className="flex items-center gap-2">
                    <Button
                      boneOnly
                      icon={<FaUserPlus className="text-2xl" />}
                      onClick={() => handleSwitchMember(slotIndex)}
                    >
                      <span className="text-xl font-semibold">Member {slotIndex + 1}</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Tavern
        active={modalType === "TAVERN"}
        sourceType="mixed"
        filter={(character) => {
          const characterCode = character.data.code;
          return characterCode === selectedMemberCode || !memberOrder.includes(characterCode);
        }}
        onSelectCharacter={(character) => {
          switchMember(
            character,
            store.select((state) => state.userdb),
            selectedMemberCode
          );
        }}
        onClose={closeModal}
      />

      <ConfirmModal
        active={modalType === "REMOVE_MEMBER"}
        danger
        focusConfirm
        message={`Remove ${selectedMemberData?.name}?`}
        onConfirm={() => actionToSelectedMember(removeMember)}
        onClose={closeModal}
      />

      <WeaponForge
        active={modalType === "WEAPON_FORGE"}
        forcedType={selectedMemberData?.weaponType}
        onForgeWeapon={(weapon) => actionToSelectedMember((code) => switchWeapon(code, weapon))}
        onClose={closeModal}
      />

      <WeaponInventory
        active={modalType === "WEAPON_INVENTORY"}
        weaponType={selectedMemberData?.weaponType}
        buttonText="Select"
        onClickButton={(weapon) => actionToSelectedMember((code) => switchWeapon(code, weapon))}
        onClose={closeModal}
      />

      <ArtifactForge
        active={modalType === "ARTIFACT_FORGE"}
        forcedType={selected.current.artifactType}
        onForgeArtifact={(artifact) =>
          actionToSelectedMember((code) => switchArtifact(code, artifact))
        }
        onClose={closeModal}
      />

      <ArtifactInventory
        active={modalType === "ARTIFACT_INVENTORY"}
        buttonText="Select"
        currentAtfGear={atfGear}
        onClickButton={(userArtifact) =>
          actionToSelectedMember((code) => switchArtifact(code, userArtifact))
        }
        onClose={closeModal}
      />
    </>
  );
}
