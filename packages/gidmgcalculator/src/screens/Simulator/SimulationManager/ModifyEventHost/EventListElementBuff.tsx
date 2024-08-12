import { useState } from "react";
import { Button } from "rond";
import { CharacterBuff, ElementType } from "@Backend";
import type { ActiveMember, SimulationManager } from "@Simulator/ToolboxProvider";
import type { InputsByMember } from "./ModifyEventHost.types";

import { useDispatch } from "@Store/hooks";
import { addEvent } from "@Store/simulator-slice";

// Component
import { ResonanceBuffItem } from "@Src/components";

interface EventListElementBuffProps {
  resonanceElmts: ElementType[];
}
export function EventListElementBuff(props: EventListElementBuffProps) {
  const dispatch = useDispatch();
  //   const [allInputs, setAllInputs] = useState(initalInputsByMember);

  //   const inputsList = allInputs[member.data.code];

  const onMakeEvent = (element: ElementType, inputs: number[]) => {
    dispatch(
      addEvent({
        type: "MODIFY",
        performer: {
          type: "SYSTEM",
        },
        modifier: {
          type: "RESONANCE",
          element,
          inputs,
        },
      })
    );
  };

  //   const onChangeInput = (modIndex: number, inputIndex: number, value: number) => {
  //     setAllInputs((prevInputsList) => {
  //       const newInputsList = { ...prevInputsList };
  //       const mod = prevInputsList[member.data.code][modIndex];

  //       if (mod) mod[inputIndex] = value;
  //       return newInputsList;
  //     });
  //   };

  return (
    <div className="space-y-3">
      {props.resonanceElmts.map((element, modIndex) => {
        // const inputs = inputsList[modIndex];

        return (
          <div key={element}>
            <ResonanceBuffItem
              mutable
              element={element}
              headingVariant="custom"
              //   inputs={inputs}
              //   inputConfigs={inputConfigs}
              //   onSelectOption={(value, inputIndex) => {
              //     onChangeInput(modIndex, inputIndex, value);
              //   }}
            />

            <div className={`flex justify-end pr-1 mt-2`}>
              <Button shape="square" size="small" className="action-btn" onClick={() => onMakeEvent(element, [])}>
                Trigger
              </Button>
            </div>

            {/* <ActionButton
              ctaText="Trigger"
              className={"pr-1 justify-end " + (inputConfigs?.length ? "mt-3" : "mt-2")}
              onClick={(alsoSwitch) => onMakeEvent(element, inputs)}
            /> */}
          </div>
        );
      })}
    </div>
  );
}
