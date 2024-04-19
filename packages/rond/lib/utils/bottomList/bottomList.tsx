import { BottomList, type BottomListProps } from "@lib/components";
import { overlayRoot } from "../common/overlay-root";

type ValueType = string | number;

export type BottomListItem =
  | ValueType
  | {
      label: React.ReactNode;
      value: ValueType;
      className?: string;
    };

type ShowArgs = Omit<BottomListProps, "active" | "onClose">;

const show = (args: ShowArgs) => {
  const updatePopup = (active: boolean) => {
    const closePopup = () => {
      if (active) updatePopup(false);
    };

    const onSelect = (value: string | number) => {
      args.onSelect?.(value);
      closePopup();
    };

    overlayRoot.render(<BottomList {...args} active={active} onSelect={onSelect} onClose={closePopup} />);
  };

  updatePopup(true);
};

export const bottomList = {
  show,
};
