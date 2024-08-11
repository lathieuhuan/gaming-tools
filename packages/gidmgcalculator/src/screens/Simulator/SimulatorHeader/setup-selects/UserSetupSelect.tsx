import { useStoreSnapshot } from "@Src/features";
import { SetupOption, SetupOptions } from "./SetupOptions";
import { Setup_, findById } from "@Src/utils";
import { calcSetupToOption } from "./setup-selects-utils";
import { CalcCharacter, UserArtifacts, UserWeapon } from "@Src/types";
import { CalcSetupOption } from "./CalcSetupSelect";

type UserSetupOption = Pick<SetupOption, "id" | "name"> & {
  members: Array<
    CalcCharacter & {
      weapon: UserWeapon;
      artifacts: UserArtifacts;
    }
  >;
};

interface UserSetupSelectProps {
  onSelect: (setup: UserSetupOption | CalcSetupOption) => void;
}
export function UserSetupSelect(props: UserSetupSelectProps) {
  //
  const setupOptions = useStoreSnapshot((state) => {
    const { userWps, userArts, userSetups = [] } = state.userdb;
    const options: (UserSetupOption | CalcSetupOption)[] = [];

    for (const setup of userSetups) {
      const option: UserSetupOption = {
        id: setup.ID,
        name: setup.name,
        members: [],
      };

      if (!Setup_.isUserSetup(setup)) {
        for (const id of Object.values(setup.allIDs)) {
          const setup = findById(userSetups, id);

          if (setup && Setup_.isUserSetup(setup)) {
            const { weapon, artifacts } = Setup_.getUserSetupItems(setup, userWps, userArts);

            if (weapon) {
              option.members.push({
                ...setup.char,
                weapon,
                artifacts,
              });
            }
          }
        }
        if (option.members.length) {
          options.push(option);
        }
      } else {
        const { weapon, artifacts } = Setup_.getUserSetupItems(setup, userWps, userArts);

        if (weapon) {
          const calcSetup = Setup_.userSetupToCalcSetup(setup, weapon, artifacts);
          options.push(calcSetupToOption(setup.ID, setup.name, calcSetup));
        }
      }
    }

    return options;
  });

  return (
    <div className="p-4">
      <SetupOptions setups={setupOptions} onSelect={props.onSelect} />
    </div>
  );
}
