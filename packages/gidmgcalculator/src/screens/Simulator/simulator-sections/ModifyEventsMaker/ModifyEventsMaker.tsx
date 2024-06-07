import { useDispatch } from "@Store/hooks";
import { addBonus } from "@Store/simulator-slice";
import { Button } from "rond";

export function ModifyEventsMaker() {
  const dispatch = useDispatch();

  const onMakeEvent = () => {
    dispatch(
      addBonus({
        type: "ATTRIBUTE",
        bonus: {
          toStat: "em",
          stable: true,
          value: 100,
          trigger: {
            character: "Albedo",
            src: "Constellation 1",
          },
        },
      })
    );
  };

  return (
    <div>
      <Button onClick={onMakeEvent}>Click</Button>
    </div>
  );
}
