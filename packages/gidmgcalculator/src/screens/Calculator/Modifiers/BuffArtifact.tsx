import { GeneralCalc } from "@Backend";

import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectArtifacts,
  toggleArtifactBuffCtrl,
  changeArtifactBuffCtrlInput,
  updateTeammateArtifact,
} from "@Store/calculator-slice";
import Object_ from "@Src/utils/object-utils";
import Array_ from "@Src/utils/array-utils";
import { ArtifactBuffsView } from "@Src/components";
import { Party } from "@Src/types";

export default function BuffArtifact({ party }: { party: Party }) {
  const dispatch = useDispatch();
  const artifacts = useSelector(selectArtifacts);
  const artBuffCtrls = useSelector((state) => state.calculator.setupsById[state.calculator.activeId].artBuffCtrls);

  return (
    <ArtifactBuffsView
      mutable
      {...{ party, artBuffCtrls }}
      setBonuses={GeneralCalc.getArtifactSetBonuses(artifacts)}
      getSelfHandlers={({ ctrl }) => {
        const path = {
          code: ctrl.code,
          ctrlIndex: ctrl.index,
        };
        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          const payload = Object.assign({ value, inputIndex }, path);
          dispatch(changeArtifactBuffCtrlInput(payload));
        };
        return {
          onToggle: () => {
            dispatch(toggleArtifactBuffCtrl(path));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateBuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateBuffCtrlInput,
          onSelectOption: updateBuffCtrlInput,
        };
      }}
      getTeammateHandlers={({ ctrl, ctrls, teammateIndex }) => {
        const updateBuffCtrl = (value: number | "toggle", inputIndex = 0) => {
          const newBuffCtrls = Object_.clone(ctrls);
          const buffCtrl = Array_.findByIndex(newBuffCtrls, ctrl.index);
          if (!buffCtrl) return;

          if (value === "toggle") {
            buffCtrl.activated = !ctrl.activated;
          } else if (buffCtrl.inputs) {
            buffCtrl.inputs[inputIndex] = value;
          } else {
            return;
          }

          dispatch(
            updateTeammateArtifact({
              teammateIndex,
              buffCtrls: newBuffCtrls,
            })
          );
        };
        return {
          onToggle: () => {
            updateBuffCtrl("toggle");
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateBuffCtrl(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateBuffCtrl,
          onSelectOption: updateBuffCtrl,
        };
      }}
    />
  );
}
