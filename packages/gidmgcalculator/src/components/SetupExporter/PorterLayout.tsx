import { ButtonGroup, Modal, type ButtonGroupItem, CloseButton, clsx } from "rond";

interface PorterLayoutProps {
  heading: string;
  message?: {
    text: string;
    type?: "success" | "error";
  };
  textareaAttrs: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  moreButtons: ButtonGroupItem[];
  onClose: () => void;
}
export function PorterLayout({
  heading,
  message,
  textareaAttrs,
  moreButtons,
  onClose,
}: PorterLayoutProps) {
  return (
    <div className="bg-dark-1 relative">
      <Modal.Header>{heading}</Modal.Header>

      <div className="px-4 flex flex-col">
        <textarea
          className="w-full p-2 bg-light-2 text-black rounded resize-none"
          rows={15}
          {...textareaAttrs}
        />

        {message ? (
          <p
            className={clsx(
              "mt-2 text-center",
              message.type === "success"
                ? " text-bonus"
                : message.type === "error"
                ? " text-danger-2"
                : ""
            )}
          >
            {message.text}
          </p>
        ) : null}
      </div>

      <ButtonGroup
        className="p-4"
        justify="end"
        buttons={[
          {
            children: "Cancel",
            onClick: onClose,
          },
          ...moreButtons,
        ]}
      />

      <CloseButton className={Modal.CLOSE_BTN_CLS} boneOnly onClick={onClose} />
    </div>
  );
}
