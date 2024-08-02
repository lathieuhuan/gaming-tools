import { useRef, useState } from "react";
import { Button, clsx } from "rond";
import { FaArrowRight } from "react-icons/fa";
import { BiLogInCircle } from "react-icons/bi";

import { $AppCharacter } from "@Src/services";
import { useStore } from "@Src/features";
import { SimulationMember } from "@Src/types";
import { parseUserCharacter } from "@Store/store.utils";
// import { useSimModalCtrl } from "../SimulatorModalsProvider";

// Component
import { GenshinImage, Tavern } from "@Src/components";
import { MemberConfig } from "./MemberConfig";

type ModalType = "SELECT_CHARACTER" | "";

interface SimulationStarterProps {
  className?: string;
}
export function SimulationStarter({ className }: SimulationStarterProps) {
  const store = useStore();
  const [members, setMembers] = useState<SimulationMember[]>([]);
  const [modalType, setModalType] = useState<ModalType>("");
  const vars = useRef({
    characterSelectedIndex: -1,
  });

  // const modalCtrl = useSimModalCtrl();

  // const onClickAdd = () => {
  //   modalCtrl.requestAddSimulation();
  // };

  const closeModal = () => setModalType("");

  const onSwitch = (memberIndex: number) => {
    setModalType("SELECT_CHARACTER");
    vars.current.characterSelectedIndex = memberIndex;
  };

  const updateMember = (memberIndex: number, newConfig: Partial<SimulationMember>) => {
    const newMembers = members.concat();

    newMembers[memberIndex] = {
      ...newMembers[memberIndex],
      ...newConfig,
    };
    setMembers(newMembers);
  };

  return (
    <>
      <div className={clsx("p-4 h-full flex justify-center", className)}>
        <div className="h-full pb-2 custom-scrollbar flex gap-2">
          {Array.from({ length: 4 }, (_, index) => {
            const character = members[index];
            const appChar = character ? $AppCharacter.get(character.name) : null;
            const className = "w-80 h-full p-4 rounded-lg bg-surface-1 shrink-0";

            if (!appChar) {
              return (
                <div key={index} className={className}>
                  <div className="flex items-center gap-2">
                    <Button boneOnly icon={<BiLogInCircle className="text-2xl" />} onClick={() => onSwitch(index)}>
                      <span className="text-xl font-semibold">Member {index + 1}</span>
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <MemberConfig
                key={index}
                className={className}
                character={character}
                appChar={appChar}
                onSwitch={() => onSwitch(index)}
                onChangeLevel={(level) => {
                  updateMember(index, { level });
                }}
                onChangeConstellation={(constellation) => {
                  updateMember(index, { cons: constellation });
                }}
                onChangeTalentLevel={(type, level) => {
                  updateMember(index, {
                    [type]: level,
                  });
                }}
                onChangeWeapon={(config) => {
                  updateMember(index, {
                    weapon: {
                      ...character.weapon,
                      ...config,
                    },
                  });
                }}
                onChangeArtifact={(index, config) => {
                  const newArtifacts = [...character.artifacts];
                  const newArtifact = newArtifacts[index];

                  if (newArtifact) {
                    Object.assign(newArtifact, config);

                    updateMember(index, {
                      artifacts: newArtifacts,
                    });
                  }
                }}
              />
            );
          })}
        </div>
      </div>

      <Tavern
        active={modalType === "SELECT_CHARACTER"}
        sourceType="mixed"
        filter={(character) => {
          return (
            character.name === members[vars.current.characterSelectedIndex]?.name ||
            members.every((member) => member.name !== character.name)
          );
        }}
        onSelectCharacter={(character) => {
          const { userWps, userArts } = store.select((state) => state.userdb);
          const { char, weapon, artifacts } = parseUserCharacter({
            character,
            userWps,
            userArts,
            weaponType: character.weaponType,
            seedID: Date.now(),
          });
          const newMembers = members.concat();

          newMembers[vars.current.characterSelectedIndex] = {
            ...char,
            weapon,
            artifacts,
          };
          setMembers(newMembers);
        }}
        onClose={closeModal}
      />
    </>
  );
}
