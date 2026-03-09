import { useRef, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { Button, clsx, ConfirmModal } from "rond";

import type { ArtifactType } from "@/types";

import { useStore } from "@/lib/dynamic-store";
import { useSimulatorStore } from "../store";
import { removeMember, switchArtifact, switchMember, switchWeapon } from "./actions";

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
  const members = useSimulatorStore((state) => state.members);

  const [modalType, setModalType] = useState<ModalType>("");
  const selected = useRef({
    memberIndex: -1,
    artifactType: undefined as ArtifactType | undefined,
  });

  const { data: selectedMember, atfGear } = members[selected.current.memberIndex] || {};

  const closeModal = () => setModalType("");

  const handleSwitchMember = (memberIndex: number) => {
    selected.current.memberIndex = memberIndex;
    setModalType("TAVERN");
  };

  const handleRemoveMember = (memberIndex: number) => {
    selected.current.memberIndex = memberIndex;
    setModalType("REMOVE_MEMBER");
  };

  const handleSwitchWeapon = (memberIndex: number) => (source: GearSwitchSource) => {
    selected.current.memberIndex = memberIndex;
    setModalType(source === "FORGE" ? "WEAPON_FORGE" : "WEAPON_INVENTORY");
  };

  const handleSwitchArtifact = (memberIndex: number) => {
    return (source: GearSwitchSource, type: ArtifactType) => {
      selected.current.memberIndex = memberIndex;
      selected.current.artifactType = type;
      setModalType(source === "FORGE" ? "ARTIFACT_FORGE" : "ARTIFACT_INVENTORY");
    };
  };

  const SLOT_CLASSNAME = "w-84 h-full p-4 rounded-lg bg-dark-1 shrink-0";

  return (
    <>
      <div className={clsx("p-4 custom-scrollbar", className)}>
        <div className="h-full pb-2 custom-scrollbar flex gap-2">
          {Array.from({ length: 4 }, (_, memberIndex) => {
            const member = members[memberIndex];
            const canAddMember = !memberIndex || members[memberIndex - 1];

            if (member) {
              return (
                <MemberConfig
                  key={memberIndex}
                  className={SLOT_CLASSNAME}
                  character={member}
                  onSwitchMember={() => handleSwitchMember(memberIndex)}
                  onRemoveMember={() => handleRemoveMember(memberIndex)}
                  onSwitchWeapon={handleSwitchWeapon(memberIndex)}
                  onSwitchArtifact={handleSwitchArtifact(memberIndex)}
                />
              );
            }

            return (
              <div key={memberIndex} className={SLOT_CLASSNAME}>
                {canAddMember && (
                  <div className="flex items-center gap-2">
                    <Button
                      boneOnly
                      icon={<FaUserPlus className="text-2xl" />}
                      onClick={() => handleSwitchMember(memberIndex)}
                    >
                      <span className="text-xl font-semibold">Member {memberIndex + 1}</span>
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
          return (
            character.name === selectedMember?.name ||
            members.every((member) => member.data.name !== character.data.name)
          );
        }}
        onSelectCharacter={(character) => {
          switchMember(
            selected.current.memberIndex,
            character,
            store.select((state) => state.userdb)
          );
        }}
        onClose={closeModal}
      />

      <ConfirmModal
        active={modalType === "REMOVE_MEMBER"}
        danger
        focusConfirm
        message={`Remove ${selectedMember?.name}?`}
        onConfirm={() => removeMember(selectedMember?.name)}
        onClose={closeModal}
      />

      <WeaponForge
        active={modalType === "WEAPON_FORGE"}
        forcedType={selectedMember?.weaponType}
        onForgeWeapon={(weapon) => switchWeapon(selectedMember?.name, weapon)}
        onClose={closeModal}
      />

      <WeaponInventory
        active={modalType === "WEAPON_INVENTORY"}
        weaponType={selectedMember?.weaponType}
        buttonText="Select"
        onClickButton={(weapon) => switchWeapon(selectedMember?.name, weapon)}
        onClose={closeModal}
      />

      <ArtifactForge
        active={modalType === "ARTIFACT_FORGE"}
        forcedType={selected.current.artifactType}
        onForgeArtifact={(artifact) => switchArtifact(selectedMember?.name, artifact)}
        onClose={closeModal}
      />

      <ArtifactInventory
        active={modalType === "ARTIFACT_INVENTORY"}
        buttonText="Select"
        currentAtfGear={atfGear}
        onClickButton={(userArtifact) => switchArtifact(selectedMember?.name, userArtifact)}
        onClose={closeModal}
      />
    </>
  );
}
