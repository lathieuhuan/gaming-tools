import clsx, { type ClassValue } from "clsx";
import { BottomSheet, type BottomSheetProps } from "../../components/BottomSheet";
import { overlayRoot } from "../common/overlay-root";
import "./bottomList.styles.scss";

type ValueType = string | number;

export type BottomListItem =
  | ValueType
  | {
      label: React.ReactNode;
      value: ValueType;
      className?: string;
    };

type ShowArgs = Pick<BottomSheetProps, "height"> & {
  title: string;
  value?: ValueType;
  items: BottomListItem[];
  /** Default to 'left' */
  align?: "left" | "right";
  itemCls?: ClassValue;
  viewOnly?: boolean;
  onSelect?: (value: string | number) => void;
};

const show = (args: ShowArgs) => {
  const { align = "left" } = args;

  const updatePopup = (active: boolean) => {
    const closePopup = () => {
      if (active) updatePopup(false);
    };

    const handleClick = (value: string | number) => {
      args.onSelect?.(value);
      closePopup();
    };

    overlayRoot.render(
      <BottomSheet active={active} height={args.height} title={args.title} onClose={closePopup}>
        <div className="ron-bottom-list__content ron-list">
          {args.items.map((option) => {
            const item = typeof option === "object" ? option : { label: option, value: option };
            return (
              <div
                key={item.value}
                className={clsx(
                  `ron-bottom-list__item ron-bottom-list__item--${align}`,
                  item.value === args.value && "ron-bottom-list__item--active",
                  args.itemCls,
                  item.className
                )}
                onClick={() => !args.viewOnly && handleClick(item.value)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </BottomSheet>
    );
  };

  updatePopup(true);
};

export const bottomList = {
  show,
};
