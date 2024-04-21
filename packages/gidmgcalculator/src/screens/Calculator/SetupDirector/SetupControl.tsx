import { FaBalanceScaleLeft, FaCopy, FaTrashAlt } from "react-icons/fa";
import { SiTarget } from "react-icons/si";
import { Button, Input } from "rond";
import type { NewSetupManageInfo } from "@Store/calculator-slice";

interface SetupControlProps {
  setup: NewSetupManageInfo;
  isStandard: boolean;
  choosableAsStandard: boolean;
  removable?: boolean;
  copiable?: boolean;
  onChangeSetupName: (newName: string) => void;
  onRemoveSetup: () => void;
  onCopySetup: () => void;
  onToggleCompared: () => void;
  onChooseStandard: () => void;
}
export function SetupControl({
  setup,
  isStandard,
  choosableAsStandard,
  removable,
  copiable,
  onChangeSetupName,
  onRemoveSetup,
  onCopySetup,
  onToggleCompared,
  onChooseStandard,
}: SetupControlProps) {
  return (
    <div className="px-2 py-3 rounded-lg bg-surface-1" onDoubleClick={() => console.log(setup)}>
      <Input
        placeholder="Enter Setup's name"
        className="w-full text-center"
        size="medium"
        value={setup.name}
        maxLength={20}
        onChange={onChangeSetupName}
      />
      <div className="mt-4 flex justify-end gap-4">
        <Button icon={<FaTrashAlt />} disabled={!removable} onClick={onRemoveSetup} />
        <Button icon={<FaCopy />} disabled={!copiable || setup.status === "NEW"} onClick={onCopySetup} />

        <Button
          className="w-8 h-8"
          size="custom"
          variant={isStandard ? "active" : "default"}
          disabled={!choosableAsStandard}
          icon={<SiTarget className="text-2xl" />}
          onClick={onChooseStandard}
        />
        <Button
          className="w-8 h-8"
          size="custom"
          variant={setup.isCompared ? "active" : "default"}
          icon={<FaBalanceScaleLeft className="text-xl" />}
          onClick={onToggleCompared}
        />
      </div>
    </div>
  );
}
