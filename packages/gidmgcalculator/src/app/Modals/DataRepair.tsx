import { Button, notification } from "rond";

import { useDispatch } from "@Store/hooks";
import {
  fixDuplicatedArtifactIds,
  fixMultipleEquippedArtifacts,
  fixMultipleEquippedWeapons,
} from "@Store/userdbSlice";

type OptionProps = {
  descriptions: string[];
  onFix: () => void;
};

function Option({ descriptions, onFix }: OptionProps) {
  return (
    <div className="pb-4 flex items-start gap-4">
      <div className="text-sm text-light-hint">
        {descriptions.map((description, index) => (
          <p key={index}>{description}</p>
        ))}
      </div>
      <Button onClick={onFix}>Fix it</Button>
    </div>
  );
}

export function DataRepair() {
  const dispatch = useDispatch();

  const fix1 = () => {
    dispatch(fixMultipleEquippedWeapons());

    notification.success({
      content: "Your weapon data has been fixed!",
    });
  };

  const fix2 = () => {
    dispatch(fixMultipleEquippedArtifacts());

    notification.success({
      content: "Your artifact data has been fixed!",
    });
  };

  const fix3 = () => {
    dispatch(fixDuplicatedArtifactIds());

    notification.success({
      content: "Your artifact data has been fixed!",
    });
  };

  return (
    <div className="space-y-4 divide-y divide-dark-line">
      <Option descriptions={["I have multiple weapons equipped on one character."]} onFix={fix1} />
      <Option
        descriptions={["I have multiple artifacts equipped on the same slot of a character."]}
        onFix={fix2}
      />
      <Option
        descriptions={[
          "When I select some artifact in My Artifacts, it does not show the details.",
          "When I equip a character with some artifact, it does not work.",
        ]}
        onFix={fix3}
      />
    </div>
  );
}
