import { useEffect } from "react";

import { $AppData } from "@Src/services";
import { Calculation_, findByIndex, getArtifactDescription } from "@Src/utils";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import {
  selectArtifacts,
  selectElmtModCtrls,
  selectParty,
  changeModCtrlInput,
  toggleModCtrl,
  updateResonance,
  updateCalcSetup,
  type ToggleModCtrlPath,
} from "@Store/calculator-slice";

// Component
import { Green, ModifierTemplate } from "@Src/components";

export function ElementDebuffs() {
  const dispatch = useDispatch();
  const elmtModCtrls = useSelector(selectElmtModCtrls);

  const { resonances, superconduct } = elmtModCtrls;
  const geoResonance = resonances.find((resonance) => resonance.vision === "geo");

  return (
    <div className="pt-2 space-y-3">
      <ModifierTemplate
        checked={superconduct}
        onToggle={() => {
          dispatch(
            updateCalcSetup({
              elmtModCtrls: {
                ...elmtModCtrls,
                superconduct: !superconduct,
              },
            })
          );
        }}
        heading="Superconduct"
        description={
          <>
            Reduces the <Green>Physical RES</Green> of enemies by <Green b>40%</Green> for 12 seconds.
          </>
        }
      />
      {geoResonance ? (
        <ModifierTemplate
          checked={geoResonance.activated}
          onToggle={() => {
            dispatch(updateResonance({ ...geoResonance, activated: !geoResonance.activated }));
          }}
          heading="Enduring Rock"
          description={
            <>
              Shielded characters dealing DMG to enemies will decrease their <Green>Geo RES</Green> by{" "}
              <Green b>20%</Green> for 15s.
            </>
          }
        />
      ) : null}
    </div>
  );
}

export function ArtifactDebuffs() {
  const dispatch = useDispatch();
  const artDebuffCtrls = useSelector((state) => {
    return state.calculator.setupsById[state.calculator.activeId].artDebuffCtrls;
  });
  const artifacts = useSelector(selectArtifacts);
  const { code, bonusLv } = Calculation_.getArtifactSetBonuses(artifacts || [])[0] || {};
  const party = useSelector(selectParty);

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

  const modifierElmts: JSX.Element[] = [];

  artDebuffCtrls.forEach((ctrl, ctrlIndex) => {
    if (!usedArtCodes.includes(ctrl.code)) return;
    const data = $AppData.getArtifactSet(ctrl.code);
    if (!data) return;

    const { debuffs = [] } = data;
    const debuff = findByIndex(debuffs, ctrl.index);

    if (debuff) {
      const path: ToggleModCtrlPath = {
        modCtrlName: "artDebuffCtrls",
        ctrlIndex,
      };
      modifierElmts.push(
        <ModifierTemplate
          key={ctrlIndex}
          heading={data.name}
          description={getArtifactDescription(data, debuff)}
          inputs={ctrl.inputs}
          inputConfigs={debuff.inputConfigs}
          checked={ctrl.activated}
          onToggle={() => {
            dispatch(toggleModCtrl(path));
          }}
          onSelectOption={(value, inputIndex) => {
            dispatch(
              changeModCtrlInput({
                ...path,
                inputIndex,
                value,
              })
            );
          }}
        />
      );
    }
  });

  // return renderModifiers(modifierElmts, "debuffs", true);
  return [];
}
