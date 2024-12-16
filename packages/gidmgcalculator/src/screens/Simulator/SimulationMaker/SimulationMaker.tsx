import { memo, useRef, useState } from "react";
import { Button, ConfirmModal, clsx } from "rond";
import { BiLogInCircle } from "react-icons/bi";
import { AppCharacter, ARTIFACT_TYPES } from "@Backend";

import { $AppCharacter } from "@Src/services";
import { useStore } from "@Src/features";
import { Artifact, SimulationMember } from "@Src/types";
import Entity_ from "@Src/utils/entity-utils";
import { RootState } from "@Store/store";
import { useDispatch, useSelector } from "@Store/hooks";
import { parseUserCharacter } from "@Store/store.utils";
import { updateAssembledSimulation, updateAssembledMember } from "@Store/simulator-slice";

// Component
import { ArtifactForge, ArtifactInventory, Tavern, WeaponForge, WeaponInventory } from "@Src/components";
import { MemberConfig } from "./MemberConfig";

type ModalType =
  | "SELECT_CHARACTER"
  | "REMOVE_MEMBER"
  | "WEAPON_FORGE"
  | "WEAPON_INVENTORY"
  | "ARTIFACT_FORGE"
  | "ARTIFACT_INVENTORY"
  | "";

const selectAssembledMembers = (state: RootState) => state.simulator.assembledSimulation.members;

const useAppMembers = (members: ReturnType<typeof selectAssembledMembers>) => {
  const appMembers = useRef<AppCharacter[]>([]);

  members.forEach((member, i) => {
    if (member) {
      const appMember = appMembers.current[i];

      if (!appMember || appMember.name !== member.name) {
        appMembers.current[i] = $AppCharacter.get(member.name);
      }
    }
  });
  return appMembers.current;
};

interface SimulationMakerProps {
  className?: string;
}
function SimulationMakerCore({ className }: SimulationMakerProps) {
  const dispatch = useDispatch();
  const store = useStore();
  const members = useSelector(selectAssembledMembers);
  const appMembers = useAppMembers(members);

  const [modalType, setModalType] = useState<ModalType>("");
  const selected = useRef({
    memberIndex: -1,
    artifactIndex: -1,
  });

  const closeModal = () => setModalType("");

  function getSelectedMember(): SimulationMember | null;
  function getSelectedMember<TKey extends keyof SimulationMember>(key: TKey): SimulationMember[TKey] | null;
  function getSelectedMember<TKey extends keyof SimulationMember>(
    key: TKey,
    defaultValue: SimulationMember[TKey]
  ): SimulationMember[TKey];

  function getSelectedMember<TKey extends keyof SimulationMember>(
    key?: TKey,
    defaultValue?: SimulationMember[TKey]
  ): SimulationMember | SimulationMember[TKey] | null {
    const member = members[selected.current.memberIndex];
    return key ? member?.[key] || defaultValue || null : member;
  }

  const onRequestSwitchMember = (memberIndex: number) => {
    selected.current.memberIndex = memberIndex;
    setModalType("SELECT_CHARACTER");
  };

  const onRequestRemoveMember = (memberIndex: number) => {
    selected.current.memberIndex = memberIndex;
    setModalType("REMOVE_MEMBER");
  };

  const updateMember = (memberIndex: number, newConfig: Partial<SimulationMember> | null) => {
    dispatch(
      updateAssembledMember({
        at: memberIndex,
        config: newConfig,
      })
    );
  };

  const switchArtifact = (newArtifact: Artifact) => {
    const newArtifacts = [...getSelectedMember("artifacts", [])];

    newArtifacts[selected.current.artifactIndex] = newArtifact;

    updateMember(selected.current.memberIndex, {
      artifacts: newArtifacts,
    });
  };

  return (
    <>
      <div className={clsx("p-4 h-full flex", className)}>
        <div className="h-full pb-2 custom-scrollbar flex gap-2">
          {members.map((character, memberIndex) => {
            const appChar = character ? appMembers[memberIndex] : null;
            const className = "w-80 h-full p-4 rounded-lg bg-surface-1 shrink-0";

            if (!character || !appChar) {
              return (
                <div key={memberIndex} className={className}>
                  <div className="flex items-center gap-2">
                    <Button
                      boneOnly
                      icon={<BiLogInCircle className="text-2xl" />}
                      onClick={() => onRequestSwitchMember(memberIndex)}
                    >
                      <span className="text-xl font-semibold">Member {memberIndex + 1}</span>
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <MemberConfig
                key={memberIndex}
                className={className}
                character={character}
                appChar={appChar}
                onRequestSwitchMember={() => onRequestSwitchMember(memberIndex)}
                onRequestRemoveMember={() => onRequestRemoveMember(memberIndex)}
                onRequestSwitchWeapon={(source) => {
                  selected.current.memberIndex = memberIndex;
                  setModalType(`WEAPON_${source}`);
                }}
                onRequestSwitchArtifact={(artifactIndex, source) => {
                  selected.current.memberIndex = memberIndex;
                  selected.current.artifactIndex = artifactIndex;
                  setModalType(`ARTIFACT_${source}`);
                }}
                onChangeLevel={(level) => {
                  updateMember(memberIndex, { level });
                }}
                onChangeConstellation={(constellation) => {
                  updateMember(memberIndex, { cons: constellation });
                }}
                onChangeTalentLevel={(type, level) => {
                  updateMember(memberIndex, {
                    [type]: level,
                  });
                }}
                onChangeWeapon={(config) => {
                  updateMember(memberIndex, {
                    weapon: {
                      ...character.weapon,
                      ...config,
                    },
                  });
                }}
                onChangeArtifact={(artifactIndex, config) => {
                  const newArtifacts = [...character.artifacts];

                  if (config) {
                    const newArtifact = newArtifacts[artifactIndex];

                    if (newArtifact) {
                      Object.assign(newArtifact, config);
                    }
                  } else {
                    newArtifacts[artifactIndex] = null;
                  }

                  updateMember(memberIndex, {
                    artifacts: newArtifacts,
                  });
                }}
                // onClickEmptyArtifact={(index) => {
                //   selected.current.memberIndex = memberIndex;
                //   selected.current.artifactIndex = index;
                //   setModalType("ARTIFACT_INVENTORY");
                // }}
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
            character.name === getSelectedMember("name") ||
            members.every((member) => !member || member.name !== character.name)
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

          newMembers[selected.current.memberIndex] = {
            ...char,
            weapon,
            artifacts,
          };
          appMembers[selected.current.memberIndex] = $AppCharacter.get(char.name);

          dispatch(updateAssembledSimulation({ members: newMembers }));
        }}
        onClose={closeModal}
      />

      <ConfirmModal
        active={modalType === "REMOVE_MEMBER"}
        danger
        focusConfirm
        message={`Remove ${appMembers[selected.current.memberIndex]?.name}?`}
        onConfirm={() => {
          updateMember(selected.current.memberIndex, null);
        }}
        onClose={closeModal}
      />

      <WeaponForge
        active={modalType === "WEAPON_FORGE"}
        forcedType={appMembers[selected.current.memberIndex]?.weaponType}
        onForgeWeapon={(weapon) => {
          updateMember(selected.current.memberIndex, { weapon });
        }}
        onClose={closeModal}
      />

      <WeaponInventory
        active={modalType === "WEAPON_INVENTORY"}
        weaponType={appMembers[selected.current.memberIndex]?.weaponType}
        buttonText="Select"
        onClickButton={(weapon) => {
          updateMember(selected.current.memberIndex, { weapon: Entity_.userItemToCalcItem(weapon) });
        }}
        onClose={closeModal}
      />

      <ArtifactForge
        active={modalType === "ARTIFACT_FORGE"}
        forcedType={ARTIFACT_TYPES[selected.current.artifactIndex]}
        onForgeArtifact={switchArtifact}
        onClose={closeModal}
      />

      <ArtifactInventory
        active={modalType === "ARTIFACT_INVENTORY"}
        buttonText="Select"
        currentArtifacts={getSelectedMember("artifacts", [])}
        onClickButton={(userArtifact) => {
          switchArtifact(Entity_.userItemToCalcItem(userArtifact));
        }}
        onClose={closeModal}
      />
    </>
  );
}

export const SimulationMaker = memo(SimulationMakerCore);
