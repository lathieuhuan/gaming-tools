import { GeoResoDebuffItem, SuperconductDebuffItem } from "@Src/components";
import { selectElmtModCtrls, updateCalcSetup, updateResonance } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";

export default function DebuffElement() {
  const dispatch = useDispatch();
  const elmtModCtrls = useSelector(selectElmtModCtrls);

  const { resonances, superconduct } = elmtModCtrls;
  const geoResonance = resonances.find((resonance) => resonance.vision === "geo");

  return (
    <div className="pt-2 space-y-3">
      <SuperconductDebuffItem
        mutable
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
      />
      {geoResonance ? (
        <GeoResoDebuffItem
          mutable
          checked={geoResonance.activated}
          onToggle={() => {
            dispatch(updateResonance({ ...geoResonance, activated: !geoResonance.activated }));
          }}
        />
      ) : null}
    </div>
  );
}
