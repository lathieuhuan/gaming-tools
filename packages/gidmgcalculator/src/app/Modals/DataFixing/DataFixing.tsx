import { Button, Modal, notification } from "rond";

import { useDispatch } from "@Store/hooks";
import { fixMultipleEquippedArtifacts, fixMultipleEquippedWeapons } from "@Store/userdb-slice";

function Option({ description, onFix }: { description: string; onFix: () => void }) {
  return (
    <div className="pb-4 flex items-start gap-4">
      <p className="text-light-hint">{description}</p>
      <Button onClick={onFix}>Fix it</Button>
    </div>
  );
}

export function DataFixingCore() {
  const dispatch = useDispatch();

  const fixDuplicatedWeapons = () => {
    dispatch(fixMultipleEquippedWeapons());
    notification.success({
      content: "Your weapon data has been fixed!",
    });
  };

  const fixDuplicatedArtifacts = () => {
    dispatch(fixMultipleEquippedArtifacts());
    notification.success({
      content: "Your artifact data has been fixed!",
    });
  };

  return (
    <div className="space-y-4 divide-y divide-dark-line">
      <Option
        description="I have multiple weapons equipped on one character."
        onFix={fixDuplicatedWeapons}
      />
      <Option
        description="I have multiple artifacts equipped on the same slot of a character."
        onFix={fixDuplicatedArtifacts}
      />
    </div>
  );
}

export const DataFixing = Modal.wrap(DataFixingCore, {
  preset: "small",
  title: "Fix my data",
  className: "bg-dark-1",
});
