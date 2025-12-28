import { useState } from "react";
import { CollapseSpace } from "rond";

type RenderProps = {
  extraExpanded: boolean;
  toggleExtra: () => void;
};

type ActionContainerProps = {
  children: (props: RenderProps) => React.ReactNode;
  extra?: React.ReactNode | ((props: RenderProps) => React.ReactNode);
};

export function ActionContainer({ children, extra }: ActionContainerProps) {
  const [extraExpanded, setExtraExpanded] = useState(false);

  const toggleExtra = () => setExtraExpanded(!extraExpanded);

  const renderProps: RenderProps = {
    extraExpanded,
    toggleExtra,
  };

  const extraContent = typeof extra === "function" ? extra(renderProps) : extra;

  return (
    <div className="flex items-center space-x-4">
      {children(renderProps)}

      <CollapseSpace className="w-full absolute top-full left-0 z-20" active={extraExpanded}>
        <div className="p-4 pb-6 shadow-common bg-dark-2">{extraContent}</div>
      </CollapseSpace>
    </div>
  );
}
