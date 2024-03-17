import type { PartyData, Teammate } from "@Src/types";

import { $AppCharacter } from "@Src/services";
import { findByIndex, parseAbilityDescription } from "@Src/utils";
import { CharacterCal } from "@Src/calculation";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectCharacter,
  selectParty,
  changeModCtrlInput,
  changeTeammateModCtrlInput,
  toggleModCtrl,
  toggleTeammateModCtrl,
  type ToggleModCtrlPath,
  type ToggleTeammateModCtrlPath,
} from "@Store/calculator-slice";

// Component
import { ModifierTemplate } from "@Src/components";

export function SelfBuffs() {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const selfBuffCtrls = useSelector((state) => state.calculator.setupsById[state.calculator.activeId].selfBuffCtrls);
  const appChar = $AppCharacter.get(char.name);
  const partyData = $AppCharacter.getPartyData(useSelector(selectParty));

  const { innateBuffs = [], buffs = [] } = $AppCharacter.get(char.name) || {};
  const modifierElmts: JSX.Element[] = [];

  innateBuffs.forEach((buff, index) => {
    if (CharacterCal.isGranted(buff, char)) {
      modifierElmts.push(
        <ModifierTemplate
          key={`innate-${index}`}
          mutable={false}
          heading={buff.src}
          description={parseAbilityDescription(buff, { char, appChar, partyData }, [], true)}
        />
      );
    }
  });

  selfBuffCtrls.forEach((ctrl, ctrlIndex) => {
    const buff = findByIndex(buffs, ctrl.index);

    if (buff && CharacterCal.isGranted(buff, char)) {
      const { inputs = [] } = ctrl;
      const path: ToggleModCtrlPath = {
        modCtrlName: "selfBuffCtrls",
        ctrlIndex,
      };
      const inputConfigs = buff.inputConfigs?.filter((config) => config.for !== "team");

      const updateBuffCtrlInput = (value: number, inputIndex: number) => {
        dispatch(changeModCtrlInput(Object.assign({ value, inputIndex }, path)));
      };

      modifierElmts.push(
        <ModifierTemplate
          key={`self-${ctrl.index}`}
          heading={buff.src}
          description={parseAbilityDescription(buff, { char, appChar, partyData }, inputs, true)}
          inputs={inputs}
          inputConfigs={inputConfigs}
          checked={ctrl.activated}
          onToggle={() => {
            dispatch(toggleModCtrl(path));
          }}
          onToggleCheck={(currentinput, inputIndex) => {
            updateBuffCtrlInput(currentinput === 1 ? 0 : 1, inputIndex);
          }}
          onChangeText={updateBuffCtrlInput}
          onSelectOption={updateBuffCtrlInput}
        />
      );
    }
  });

  // return renderModifiers(modifierElmts, "buffs", true);
  return [];
}

export function PartyBuffs() {
  const party = useSelector(selectParty);
  const partyData = $AppCharacter.getPartyData(useSelector(selectParty));
  const modifierElmts: JSX.Element[] = [];

  party.forEach((teammate, index) => {
    if (teammate && teammate.buffCtrls.length) {
      modifierElmts.push(<TeammateBuffs key={index} teammate={teammate} teammateIndex={index} partyData={partyData} />);
    }
  });
  // return renderModifiers(modifierElmts, "buffs");
  return [];
}

interface TeammateBuffsProps {
  teammate: Teammate;
  teammateIndex: number;
  partyData: PartyData;
}
function TeammateBuffs({ teammate, teammateIndex, partyData }: TeammateBuffsProps) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);

  const modifierElmts: JSX.Element[] = [];
  const teammateData = $AppCharacter.get(teammate.name);

  teammate.buffCtrls.forEach((ctrl, ctrlIndex) => {
    const { inputs = [] } = ctrl;
    const buff = findByIndex(teammateData.buffs || [], ctrl.index);
    if (!buff) return;

    const path: ToggleTeammateModCtrlPath = {
      teammateIndex,
      modCtrlName: "buffCtrls",
      ctrlIndex,
    };

    const updateBuffCtrlInput = (value: number, inputIndex: number) => {
      dispatch(changeTeammateModCtrlInput(Object.assign({ value, inputIndex }, path)));
    };

    modifierElmts.push(
      <ModifierTemplate
        key={ctrl.index}
        checked={ctrl.activated}
        heading={buff.src}
        description={parseAbilityDescription(buff, { char, appChar: teammateData, partyData }, inputs, false)}
        inputs={inputs}
        inputConfigs={buff.inputConfigs}
        onToggle={() => {
          dispatch(toggleTeammateModCtrl(path));
        }}
        onToggleCheck={(currentInput, inputIndex) => {
          updateBuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
        }}
        onChangeText={updateBuffCtrlInput}
        onSelectOption={updateBuffCtrlInput}
      />
    );
  });

  return (
    <div>
      <p className={`text-lg text-${teammateData.vision} font-bold text-center uppercase`}>{teammate.name}</p>
      <div className="mt-1 space-y-3">{modifierElmts}</div>
    </div>
  );
}
