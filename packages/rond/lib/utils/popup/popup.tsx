import { BottomSheet } from "../../components/BottomSheet";
import { overlayRoot } from "../common/overlay-root";
// import "./message.styles.scss";

export type PopupOption =
  | string
  | number
  | {
      label: string | number;
      value: string | number;
    };

const show = (title: string, options: PopupOption[], onSelect: (value: string | number) => void) => {
  const updatePopup = (active: boolean) => {
    const closePopup = () => {
      if (active) updatePopup(false);
    };

    const handleClick = (value: string | number) => {
      onSelect(value);
      closePopup();
    };

    overlayRoot.render(
      <BottomSheet active={active} title={title} onClose={closePopup}>
        <div>
          {options.map((option) => {
            const item = typeof option === "object" ? option : { label: option, value: option };
            return (
              <div key={item.value} onClick={() => handleClick(item.value)}>
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

export const popup = {
  show,
};
