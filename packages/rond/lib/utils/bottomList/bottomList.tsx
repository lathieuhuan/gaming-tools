import { BottomList, type BottomListProps } from "@lib/components";
import { overlayRoot } from "../common/overlay-root";

type ShowArgs<T extends Record<string, unknown> = Record<string, unknown>> = Omit<
  BottomListProps<T>,
  "active" | "onClose"
>;

function show<T extends Record<string, unknown> = Record<string, unknown>>(args: ShowArgs<T>) {
  const updatePopup = (active: boolean) => {
    const closePopup = () => {
      if (active) updatePopup(false);
    };

    overlayRoot.render(
      <BottomList<T>
        {...args}
        active={active}
        onSelect={(value, item) => {
          args.onSelect?.(value, item);
          closePopup();
        }}
        onClose={closePopup}
      />
    );
  };

  updatePopup(true);
}

export const bottomList = {
  show,
};
