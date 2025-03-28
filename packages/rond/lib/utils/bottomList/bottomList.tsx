import { BottomList, BottomListValue, type BottomListProps } from "@lib/components";
import { overlayRoot } from "../common/overlay-root";

function show<
  TValue extends BottomListValue = BottomListValue,
  TData extends Record<string, unknown> = Record<string, unknown>
>(args: Omit<BottomListProps<TValue, TData>, "active" | "onClose">) {
  //
  const updatePopup = (active: boolean) => {
    const closePopup = () => {
      if (active) updatePopup(false);
    };

    overlayRoot.render(
      <BottomList<TValue, TData>
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
