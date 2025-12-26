import { cn, type ClassValue } from "rond";
import type { AppCharacter } from "@/types";

type EnhanceTagProps = {
  className?: ClassValue;
  character: {
    enhanced: boolean;
    data: AppCharacter;
  };
  mutable?: boolean;
  onToggle?: () => void;
};

export function EnhanceTag(props: EnhanceTagProps) {
  const { enhanced, data } = props.character;

  return (
    <div
      className={cn(
        "text-base font-semibold leading-none",
        props.mutable && "cursor-pointer",
        props.className
      )}
      hidden={!data.enhanceType}
      onClick={props.mutable ? props.onToggle : undefined}
    >
      <p
        className={cn(
          "capitalize",
          enhanced ? `text-${data.vision}` : ["text-light-hint", props.mutable && "glow-on-hover"]
        )}
      >
        {data.enhanceType?.toLowerCase()}
      </p>
    </div>
  );
}
