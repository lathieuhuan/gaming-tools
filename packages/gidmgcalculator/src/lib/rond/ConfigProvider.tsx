import type { IconType } from "react-icons";
import { FaQuestion, FaUser } from "react-icons/fa";
import { RiSwordFill } from "react-icons/ri";
import { ConfigProvider as RondConfigProvider, type DefaultImageFallbackProps } from "rond";

const ICONS_BY_TYPE: Record<string, IconType> = {
  character: FaUser,
  weapon: RiSwordFill,
  artifact: FaQuestion,
};

function ImageFallback({ type, className }: DefaultImageFallbackProps) {
  const Fallback = type in ICONS_BY_TYPE ? ICONS_BY_TYPE[type] : FaQuestion;
  return (
    <div className={className}>
      <Fallback className="w-full h-full" />
    </div>
  );
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  return <RondConfigProvider config={{ ImageFallback }}>{children}</RondConfigProvider>;
}
