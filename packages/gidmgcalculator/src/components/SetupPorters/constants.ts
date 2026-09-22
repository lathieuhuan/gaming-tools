import type { ModalProps } from "rond";

export const SETUP_PORTER_MODAL_PROPS = {
  preset: "small",
  className: "bg-dark-1",
} as const satisfies Omit<ModalProps, "children">;
