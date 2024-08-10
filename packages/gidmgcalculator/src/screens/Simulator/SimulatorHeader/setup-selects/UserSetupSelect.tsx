import { useStoreSnapshot } from "@Src/features";
import { SetupOptions } from "./SetupOptions";
import { Setup_ } from "@Src/utils";

interface UserSetupSelectProps {
  onSelect: () => void;
}
export function UserSetupSelect(props: UserSetupSelectProps) {
  //
  const setups = useStoreSnapshot((state) => {
    const { userWps, userArts, userSetups = [] } = state.userdb;
    const a = [];

    for (const setup of userSetups) {
      if (Setup_.isUserSetup(setup)) {
        
      }
    }

    return [];

    // return userSetups.map((setup) => {
    //   if (Setup_.isUserSetup(setup)) {
    //   }
    // });
  });

  return (
    <div className="p-4">
      <SetupOptions setups={setups} onSelect={props.onSelect} />
    </div>
  );
}
