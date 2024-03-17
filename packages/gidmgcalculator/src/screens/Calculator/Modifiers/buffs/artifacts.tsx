import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectArtifacts,
  selectParty,
  // changeModCtrlInput,
  // toggleModCtrl,
  // updateTeammateArtifact,
  // type ToggleModCtrlPath,
} from "@Store/calculator-slice";

// Util
import { Calculation_ } from "@Src/utils";
import { ArtifactBuffsView } from "@Src/components";

export const ArtifactBuffs = () => {
  const dispatch = useDispatch();
  const artifacts = useSelector(selectArtifacts);
  const artBuffCtrls = useSelector((state) => state.calculator.setupsById[state.calculator.activeId].artBuffCtrls);
  const party = useSelector(selectParty);

  // const modifierElmts: (JSX.Element | null)[] = [];
  // const mainCode = Calculation_.getArtifactSetBonuses(artifacts)[0]?.code;

  // if (mainCode) {
  //   modifierElmts.push(
  //     ...renderArtifactModifiers({
  //       fromSelf: true,
  //       keyPrefix: "main",
  //       code: mainCode,
  //       ctrls: artBuffCtrls,
  //       getHanlders: (ctrl, ctrlIndex) => {
  //         const path: ToggleModCtrlPath = {
  //           modCtrlName: "artBuffCtrls",
  //           ctrlIndex,
  //         };
  //         const updateBuffCtrlInput = (value: number, inputIndex: number) => {
  //           dispatch(changeModCtrlInput(Object.assign({ value, inputIndex }, path)));
  //         };
  //         return {
  //           onToggle: () => {
  //             dispatch(toggleModCtrl(path));
  //           },
  //           onToggleCheck: (currentInput, inputIndex) => {
  //             updateBuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
  //           },
  //           onChangeText: updateBuffCtrlInput,
  //           onSelectOption: updateBuffCtrlInput,
  //         };
  //       },
  //     })
  //   );
  // }

  // party.forEach((teammate, teammateIndex) => {
  //   if (teammate) {
  //     const { buffCtrls } = teammate.artifact;

  //     modifierElmts.push(
  //       ...renderArtifactModifiers({
  //         keyPrefix: teammate.name,
  //         code: teammate.artifact.code,
  //         ctrls: buffCtrls,
  //         getHanlders: (ctrl) => {
  //           const updateBuffCtrl = (value: ModifierInput | "toggle", inputIndex = 0) => {
  //             const newBuffCtrls = deepCopy(buffCtrls);
  //             const buffCtrl = findByIndex(newBuffCtrls, ctrl.index);
  //             if (!buffCtrl) return;

  //             if (value === "toggle") {
  //               buffCtrl.activated = !ctrl.activated;
  //             } else if (buffCtrl.inputs) {
  //               buffCtrl.inputs[inputIndex] = value;
  //             } else {
  //               return;
  //             }

  //             dispatch(
  //               updateTeammateArtifact({
  //                 teammateIndex,
  //                 buffCtrls: newBuffCtrls,
  //               })
  //             );
  //           };
  //           return {
  //             onToggle: () => {
  //               updateBuffCtrl("toggle");
  //             },
  //             onToggleCheck: (currentInput, inputIndex) => {
  //               updateBuffCtrl(currentInput === 1 ? 0 : 1, inputIndex);
  //             },
  //             onChangeText: updateBuffCtrl,
  //             onSelectOption: updateBuffCtrl,
  //           };
  //         },
  //       })
  //     );
  //   }
  // });

  // return renderModifiers(modifierElmts, "buffs", true);
  return (
    <ArtifactBuffsView
      artBuffCtrls={artBuffCtrls}
      party={party}
      setBonuses={Calculation_.getArtifactSetBonuses(artifacts)}
    />
  );
};
