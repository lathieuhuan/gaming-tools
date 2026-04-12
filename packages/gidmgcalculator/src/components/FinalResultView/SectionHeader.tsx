import { ReactNode } from "react";
import { FaCaretRight } from "react-icons/fa";

type SectionHeaderProps = {
  title: string;
  open: boolean;
  level?: number;
  extra?: ReactNode;
  onClickTitle: () => void;
};

export function SectionHeader({ title, open, level, extra, onClickTitle }: SectionHeaderProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        className="pl-2 pr-3 text-base text-black bg-heading leading-none font-bold flex items-center gap-2 rounded-2xl overflow-hidden"
        onClick={onClickTitle}
      >
        <div className="py-1.5 flex items-center gap-1">
          <FaCaretRight
            className={"text-base duration-150 ease-linear" + (open ? " rotate-90" : "")}
          />
          <span>{title}</span>
        </div>

        {!level === false && (
          <span className="px-1 rounded-sm bg-black/60 text-light-1 text-sm">{level}</span>
        )}
      </button>

      <div className="flex">{extra}</div>
    </div>
  );
}
