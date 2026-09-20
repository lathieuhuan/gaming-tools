import type { ComponentProps, ReactNode } from "react";
import { clsx, cn } from "rond";

export type SetupPorterProps = {
  message?: {
    text: string;
    type: "success" | "error";
  };
  note?: ReactNode;
  textareaProps: ComponentProps<"textarea">;
  actions?: ReactNode;
};

export function SetupPorter({ message, note, textareaProps, actions }: SetupPorterProps) {
  return (
    <div>
      {note != null && <div className="mb-2 text-sm">{note}</div>}

      <div className="flex flex-col">
        <textarea
          rows={12}
          {...textareaProps}
          className={cn(
            "w-full p-2 bg-light-2 text-black rounded resize-none",
            textareaProps.className,
          )}
        />

        {message !== undefined && (
          <p
            className={clsx("mt-2 text-center", {
              "text-bonus": message.type === "success",
              "text-danger-2": message.type === "error",
            })}
          >
            {message.text}
          </p>
        )}
      </div>

      {actions != null && <div className="mt-4 flex gap-3 justify-end">{actions}</div>}
    </div>
  );
}
