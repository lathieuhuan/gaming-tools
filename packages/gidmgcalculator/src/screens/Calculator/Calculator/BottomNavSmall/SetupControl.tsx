import type { ComponentProps } from "react";
import { FaArrowUp, FaSave, FaShareAlt } from "react-icons/fa";
import { Button, type ButtonProps } from "rond";

import { MultiSetupChange } from "@Store/calculator/actions";
import { useCalcModalCtrl } from "../../ContextProvider";
import {
  DuplicateButton,
  NameInput,
  RemoveButton,
  SelectStandardButton,
  ToggleCompareButton,
} from "../../SetupDraftKit";

type SetupControlProps = Omit<ComponentProps<"div">, "children"> & {
  setup: MultiSetupChange;
  active?: boolean;
  onSelect?: () => void;
};

export function SetupControl({ setup, active, onSelect, ...props }: SetupControlProps) {
  const calcModalCtrl = useCalcModalCtrl();

  return (
    <div {...props}>
      <div className="flex gap-4">
        <NameInput className="grow" value={setup.name} setupId={setup.ID} />

        <div className="w-8 h-8 shrink-0">
          {setup.status === "OLD" && (
            <Button
              shape="square"
              variant={active ? "active" : "default"}
              icon={<FaArrowUp />}
              onClick={onSelect}
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex">
        <RemoveButton {...ACTION_PROPS} setupId={setup.ID} />

        <Button
          {...ACTION_PROPS}
          className={[ACTION_PROPS.className, "text-lg"]}
          icon={<FaShareAlt />}
          disabled={setup.status !== "OLD"}
          onClick={() => calcModalCtrl.requestShareSetup(setup.ID)}
        />

        <Button
          {...ACTION_PROPS}
          className={[ACTION_PROPS.className, "text-lg"]}
          icon={<FaSave />}
          disabled={setup.status !== "OLD"}
          onClick={() => calcModalCtrl.requestSaveSetup(setup.ID)}
        />

        <DuplicateButton
          {...ACTION_PROPS}
          className={[ACTION_PROPS.className, "text-lg"]}
          setupId={setup.ID}
        />

        <ToggleCompareButton
          {...ACTION_PROPS}
          className={[
            ACTION_PROPS.className,
            "text-xlp text-light-1 data-[active=true]:text-bonus",
          ]}
          setupId={setup.ID}
        />

        <SelectStandardButton
          {...ACTION_PROPS}
          className={[
            ACTION_PROPS.className,
            "text-xlp text-light-1 data-[active=true]:text-bonus",
          ]}
          setup={setup}
        />
      </div>
    </div>
  );
}

const ACTION_PROPS: ButtonProps = {
  variant: "custom",
  shape: "square",
  withShadow: false,
  className: "size-10 flex-center",
};
