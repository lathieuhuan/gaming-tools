import { useId, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button, CloseButton, InputNumber, Modal, ModalProps, TrashCanSvg } from "rond";
import { CopySection } from "../../components/CopySection";

export type ModItemRenderConfig = {
  label: string;
  value: number;
  min: number;
  max: number;
};

export type CopyOption = {
  value: number;
  label: string;
};

type CreateFormProps = {
  id: string;
  onSubmit: () => void;
};

type CustomModLayoutProps = {
  copyOptions: CopyOption[];
  items: ModItemRenderConfig[];
  createModalProps?: Pick<ModalProps, "title" | "style">;
  onCopy: (option: CopyOption) => void;
  onValueChange: (value: number, index: number) => void;
  onRemoveItem: (index: number) => void;
  onRemoveAll: () => void;
  renderCreateForm: (props: CreateFormProps) => JSX.Element;
};

export function CustomModLayout({
  copyOptions,
  items,
  createModalProps,
  onCopy,
  onValueChange,
  onRemoveItem,
  onRemoveAll,
  renderCreateForm,
}: CustomModLayoutProps) {
  const id = useId();
  const [modalOn, setModalOn] = useState(false);

  const closeModal = () => setModalOn(false);

  return (
    <div className="flex flex-col">
      <div className="mt-3 flex justify-between">
        <Button title="Discard all" icon={<TrashCanSvg />} disabled={items.length === 0} onClick={onRemoveAll} />
        <Button
          title="Add"
          icon={<FaPlus />}
          variant="primary"
          disabled={items.length > 9}
          onClick={() => setModalOn(true)}
        />
      </div>

      {copyOptions.length ? <CopySection className="mt-6" options={copyOptions} onClickCopy={onCopy} /> : null}

      <div className="mt-6 flex flex-col-reverse space-y-4 space-y-reverse" style={{ marginLeft: "-0.5rem" }}>
        {items.map((item, itemI) => {
          return (
            <div key={itemI} className="flex items-center">
              <CloseButton boneOnly onClick={() => onRemoveItem(itemI)} />

              <p className="pl-1 pr-2 text-sm capitalize">{item.label}</p>

              <InputNumber
                className="ml-auto w-16 font-semibold"
                size="medium"
                min={item.min}
                max={item.max}
                maxDecimalDigits={1}
                step="0.1"
                value={item.value}
                onChange={(value) => onValueChange(value, itemI)}
              />
            </div>
          );
        })}
      </div>

      <Modal
        active={modalOn}
        className="bg-surface-1"
        formId={id}
        {...createModalProps}
        withActions
        withHeaderDivider={false}
        onClose={closeModal}
      >
        {renderCreateForm({ id, onSubmit: closeModal })}
      </Modal>
    </div>
  );
}
