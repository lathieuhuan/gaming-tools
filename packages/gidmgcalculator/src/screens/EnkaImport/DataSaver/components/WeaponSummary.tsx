import type { MouseEvent } from "react";
import { clsx, Radio } from "rond";

import type { RawWeapon } from "@/types";

const SLOT_NAME = "weapon-summary";

export function WeaponSubtitle({ item }: { item: RawWeapon }) {
  return (
    <div className="text-sm text-light-4 flex items-center gap-2">
      <span>Level: {item.level}</span>
      <span className="text-dark-line">|</span>
      <span>Refinement: {item.refi}</span>
    </div>
  );
}

type WeaponSummaryProps = {
  className?: string;
  /** Default "default" */
  variant?: "primary" | "default";
  label: React.ReactNode;
  weapon: RawWeapon;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export function WeaponSummary(props: WeaponSummaryProps) {
  const { variant = "default", weapon } = props;

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget
      .closest(`div[data-slot='${SLOT_NAME}']`)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      data-slot={SLOT_NAME}
      className={clsx("px-3 py-2 rounded-md bg-dark-1 relative", props.className)}
    >
      <p
        className={
          variant === "primary" ? "text-primary-1 font-semibold" : "text-light-1 font-medium"
        }
      >
        {props.label}
      </p>

      <div className="text-sm text-light-4 flex items-center gap-2">
        <span>Level: {weapon.level}</span>
        <span className="text-dark-line">|</span>
        <span>Refinement: {weapon.refi}</span>
      </div>

      {props.selectable && (
        <div className="absolute top-4 right-4">
          <Radio
            size="medium"
            checked={props.selected}
            onChange={props.onSelect}
            onClick={handleClick}
          />
        </div>
      )}
    </div>
  );
}
