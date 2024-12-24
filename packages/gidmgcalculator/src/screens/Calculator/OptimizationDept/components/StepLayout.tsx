import { FaCaretRight } from "react-icons/fa";
import { ButtonGroup } from "rond";

export interface StepLayoutProps {
  isCompletable: boolean;
  disabledGoBack: boolean;
  goBack: () => void;
  goNext: () => void;
  children: React.ReactNode;
}
export function StepLayout(props: StepLayoutProps) {
  return (
    <div className="h-full flex flex-col hide-scrollbar">
      <div className="grow hide-scrollbar">{props.children}</div>

      <ButtonGroup
        className="mt-3 mb-1"
        buttons={[
          {
            children: "Back",
            icon: <FaCaretRight className="text-lg rotate-180" />,
            disabled: props.disabledGoBack,
            onClick: props.goBack,
          },
          {
            children: "Next",
            icon: <FaCaretRight className="text-lg" />,
            iconPosition: "end",
            disabled: !props.isCompletable,
            onClick: props.goNext,
          },
        ]}
      />
    </div>
  );
}
