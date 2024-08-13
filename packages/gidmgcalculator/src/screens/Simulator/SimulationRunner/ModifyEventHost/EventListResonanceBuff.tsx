import { Button } from "rond";
import { ElementType } from "@Backend";

import { SystemModifyEvent } from "@Src/types";
import { useDispatch } from "@Store/hooks";
import { addEvent } from "@Store/simulator-slice";

// Component
import { RESONANCE_INFO, ResonanceBuffItem } from "@Src/components";

type ModifierElement = SystemModifyEvent["modifier"]["element"];

export interface EventListResonanceBuffProps {
  geoResonated: boolean;
  dendroResonated: boolean;
}
export function EventListResonanceBuff(props: EventListResonanceBuffProps) {
  const dispatch = useDispatch();

  const onMakeEvent = (element: ModifierElement) => {
    dispatch(
      addEvent({
        type: "SYSTEM_MODIFY",
        modifier: {
          type: "RESONANCE",
          element,
        },
      })
    );
  };

  const buffItems: Array<{
    element: ElementType;
    description: string;
    modifierElmt: ModifierElement;
  }> = [];

  if (props.geoResonated) {
    buffItems.push({
      element: "geo",
      description: RESONANCE_INFO.geo.description?.[1],
      modifierElmt: "geo",
    });
  }
  if (props.dendroResonated) {
    buffItems.push(
      {
        element: "dendro",
        description: RESONANCE_INFO.dendro.description?.[1],
        modifierElmt: "dendro_strong",
      },
      {
        element: "dendro",
        description: RESONANCE_INFO.dendro.description?.[2],
        modifierElmt: "dendro_weak",
      }
    );
  }

  return (
    <div className="space-y-3">
      {buffItems.map((item) => {
        return (
          <div key={item.modifierElmt}>
            <ResonanceBuffItem mutable element={item.element} headingVariant="custom" description={item.description} />
            <div className="flex justify-end pr-1 mt-2">
              <Button shape="square" size="small" onClick={() => onMakeEvent(item.modifierElmt)}>
                Trigger
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
