import type { PartyData, Teammate } from "@Src/types";

import { findByIndex, parseAbilityDescription } from "@Src/utils";
import { CharacterCal } from "@Src/calculation";
import { $AppCharacter } from "@Src/services";

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

export function SelfDebuffs({ partyData }: { partyData: PartyData }) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const selfDebuffCtrls = useSelector(
    (state) => state.calculator.setupsById[state.calculator.activeId].selfDebuffCtrls
  );

  const appChar = $AppCharacter.get(char.name) || {};
  const modifierElmts: JSX.Element[] = [];

  selfDebuffCtrls.forEach((ctrl) => {
    const debuff = findByIndex(appChar.debuffs || [], ctrl.index);

    if (debuff && CharacterCal.isGranted(debuff, char)) {
      const { inputs = [] } = ctrl;
      const path: ToggleModCtrlPath = {
        modCtrlName: "selfDebuffCtrls",
        ctrlIndex: ctrl.index,
      };
      const inputConfigs = debuff.inputConfigs?.filter((config) => config.for !== "team");

      const updateDebuffCtrlInput = (value: number, inputIndex: number) => {
        dispatch(changeModCtrlInput(Object.assign({ value, inputIndex }, path)));
      };

      modifierElmts.push(
        <ModifierTemplate
          key={ctrl.index}
          heading={debuff.src}
          description={parseAbilityDescription(debuff, { char, appChar, partyData }, inputs, true)}
          inputs={inputs}
          inputConfigs={inputConfigs}
          checked={ctrl.activated}
          onToggle={() => {
            dispatch(toggleModCtrl(path));
          }}
          onToggleCheck={(currentInput, inputIndex) => {
            updateDebuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          }}
          onChangeText={updateDebuffCtrlInput}
          onSelectOption={updateDebuffCtrlInput}
        />
      );
    }
  });
  // return renderModifiers(modifierElmts, "debuffs", true);
  return [];
}

export function PartyDebuffs({ partyData }: { partyData: PartyData }) {
  const party = useSelector(selectParty);
  const modifierElmts: JSX.Element[] = [];

  party.forEach((teammate, teammateIndex) => {
    if (teammate && teammate.debuffCtrls.length)
      modifierElmts.push(<TeammateDebuffs key={teammateIndex} {...{ teammate, teammateIndex, partyData }} />);
  });
  // return renderModifiers(modifierElmts, "debuffs");
  return [];
}

interface TeammateDebuffsProps {
  teammate: Teammate;
  teammateIndex: number;
  partyData: PartyData;
}
function TeammateDebuffs({ teammate, teammateIndex, partyData }: TeammateDebuffsProps) {
  const char = useSelector(selectCharacter);
  const dispatch = useDispatch();

  const teammateData = $AppCharacter.get(teammate.name);
  if (!teammateData) return null;

  const modifierElmts: JSX.Element[] = [];

  teammate.debuffCtrls.forEach((ctrl) => {
    const debuff = findByIndex(teammateData.debuffs || [], ctrl.index);
    if (!debuff) return;

    const { inputs = [] } = ctrl;
    const path: ToggleTeammateModCtrlPath = {
      teammateIndex,
      modCtrlName: "debuffCtrls",
      ctrlIndex: ctrl.index,
    };
    const inputConfigs = debuff.inputConfigs?.filter((config) => config.for !== "self");

    const updateDebuffCtrlInput = (value: number, inputIndex: number) => {
      dispatch(changeTeammateModCtrlInput(Object.assign({ value, inputIndex }, path)));
    };

    modifierElmts.push(
      <ModifierTemplate
        key={ctrl.index}
        heading={debuff.src}
        description={parseAbilityDescription(debuff, { char, appChar: teammateData, partyData }, inputs, false)}
        inputs={inputs}
        inputConfigs={inputConfigs}
        checked={ctrl.activated}
        onToggle={() => {
          dispatch(toggleTeammateModCtrl(path));
        }}
        onToggleCheck={(currentInput, inputIndex) => {
          updateDebuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
        }}
        onChangeText={updateDebuffCtrlInput}
        onSelectOption={updateDebuffCtrlInput}
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
