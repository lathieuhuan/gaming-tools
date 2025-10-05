export type ButtonVariant = "default" | "primary" | "danger" | "active";

export const CN_BY_VARIANT: Record<ButtonVariant, string> = {
  default: "bg-light-2 text-black",
  primary: "bg-primary-1 text-black",
  danger: "bg-danger-1 text-white",
  active: "bg-active text-black",
};

export const CN_BY_BONE_VARIANT: Record<ButtonVariant, string> = {
  default: "text-white",
  primary: "text-primary-1",
  danger: "text-danger-1",
  active: "text-active",
};

export type ButtonShape = "rounded" | "square";

export const CN_BY_SHAPE: Record<ButtonShape, string> = {
  rounded: "rounded-full",
  square: "rounded-sm",
};

export type ButtonSize = "small" | "medium" | "large";

export const CN_BY_SIZE: Record<ButtonSize, string> = {
  small: "px-2 py-0.5 gap-1",
  medium: "px-3 py-1.5 gap-1.5",
  large: "px-3 py-1.5 gap-1.5",
};

export const CN_BY_ICON_SIZE: Record<ButtonSize, string> = {
  small: "size-6",
  medium: "size-8 text-base",
  large: "size-9 text-xl",
};

export const CLOSE_ICON_CN_BY_SIZE: Record<ButtonSize, string> = {
  small: "text-base",
  medium: "text-xlp",
  large: "text-2xl",
};