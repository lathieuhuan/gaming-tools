import { useEffect } from "react";
import { GeneralCalc } from "@Backend";

import type { Party } from "@Src/types";
import { changeModCtrlInput, selectArtifacts, toggleModCtrl, type ToggleModCtrlPath } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { ArtifactDebuffsView } from "@Src/components";

export default function ArtifactDebuffs({ party }: { party: Party }) {
  const dispatch = useDispatch();
  const artDebuffCtrls = useSelector((state) => {
    return state.calculator.setupsById[state.calculator.activeId].artDebuffCtrls;
  });
  const artifacts = useSelector(selectArtifacts);
  const { code, bonusLv } = GeneralCalc.getArtifactSetBonuses(artifacts || [])[0] || {};

  const usedArtCodes = party.reduce(
    (accumulator, teammate) => {
      if (teammate && teammate.artifact.code) {
        accumulator.push(teammate.artifact.code);
      }
      return accumulator;
    },
    [code && bonusLv === 1 ? code : 0]
  );

  useEffect(() => {
    artDebuffCtrls.forEach((ctrl, ctrlIndex) => {
      if (ctrl.activated && !usedArtCodes.includes(ctrl.code)) {
        dispatch(
          toggleModCtrl({
            modCtrlName: "artDebuffCtrls",
            ctrlIndex,
          })
        );
      }
    });
  }, [JSON.stringify(usedArtCodes)]);

  return (
    <ArtifactDebuffsView
      mutable
      artDebuffCtrls={artDebuffCtrls.filter((ctrl) => usedArtCodes.includes(ctrl.code))}
      getHanlders={({ ctrl }) => {
        const path: ToggleModCtrlPath = {
          modCtrlName: "artDebuffCtrls",
          ctrlIndex: artDebuffCtrls.findIndex((debuffCtrl) => debuffCtrl.code === ctrl.code),
        };

        return {
          onToggle: () => {
            dispatch(toggleModCtrl(path));
          },
          onSelectOption: (value, inputIndex) => {
            dispatch(
              changeModCtrlInput({
                ...path,
                inputIndex,
                value,
              })
            );
          },
        };
      }}
    />
  );
}
