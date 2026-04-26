import { FaUserPlus } from "react-icons/fa";
import { Button, clsx } from "rond";

import type { ArtifactType } from "@/types";

import { updateAssemblingModal } from "../actions/prepare";
import { selectSimulation, useSimulatorStore } from "../store";

import { AssemblingModals } from "./AssemblingModals";
import { GearSwitchSource, MemberConfig } from "./MemberConfig";

type TeamAssemblerProps = {
  className?: string;
};

export function TeamAssembler({ className }: TeamAssemblerProps) {
  const memberOrder = useSimulatorStore((state) => selectSimulation(state).memberOrder);

  const handleSwitchMember = (slot: number) => {
    updateAssemblingModal({ type: "TAVERN", slot });
  };

  const handleRemoveMember = (slot: number) => {
    updateAssemblingModal({ type: "REMOVE_MEMBER", slot });
  };

  const handleSwitchWeapon = (slot: number) => (source: GearSwitchSource) => {
    updateAssemblingModal({
      type: source === "FORGE" ? "WEAPON_FORGE" : "WEAPON_INVENTORY",
      slot,
    });
  };

  const handleSwitchArtifact = (slot: number) => {
    return (source: GearSwitchSource, type: ArtifactType) => {
      updateAssemblingModal({
        type: source === "FORGE" ? "ARTIFACT_FORGE" : "ARTIFACT_INVENTORY",
        slot,
        artifactType: type,
      });
    };
  };

  const SLOT_CLASSNAME = "w-84 h-full p-4 rounded-lg bg-dark-1 shrink-0";

  return (
    <>
      <div className={clsx("p-4 custom-scrollbar", className)}>
        <div className="h-full pb-2 custom-scrollbar flex gap-2">
          {Array.from({ length: 4 }, (_, slotIndex) => {
            const memberCode = memberOrder.at(slotIndex);

            if (memberCode) {
              return (
                <MemberConfig
                  key={slotIndex}
                  className={SLOT_CLASSNAME}
                  memberCode={memberCode}
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

      <AssemblingModals />
    </>
  );
}
