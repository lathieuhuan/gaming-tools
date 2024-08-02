import { useRef, useState } from "react";
import { clsx } from "rond";

import { Tavern } from "@Src/components";
import { useStore } from "@Src/features";
import { SimulationMember } from "@Src/types";
import { parseUserCharacter } from "@Store/store.utils";
import { MemberConfig } from "./MemberConfig";
// import { useSimModalCtrl } from "../SimulatorModalsProvider";

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
        <div className="h-full pb-2 custom-scrollbar flex gap-3">
          {Array.from({ length: 4 }, (_, index) => {
            return (
              <div key={index} className="w-80 h-full p-4 rounded-lg bg-surface-1 shrink-0">
                <MemberConfig
                  character={members[index]}
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
                />
              </div>
            );
          })}
        </div>
      </div>

      <Tavern
        active={modalType === "SELECT_CHARACTER"}
        sourceType="mixed"
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
