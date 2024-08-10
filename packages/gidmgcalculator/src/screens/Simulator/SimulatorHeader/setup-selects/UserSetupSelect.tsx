import { useStoreSnapshot } from "@Src/features";
import { SetupOptions } from "./SetupOptions";
import { Setup_ } from "@Src/utils";

interface UserSetupSelectProps {
  onSelect: () => void;
}
export function UserSetupSelect(props: UserSetupSelectProps) {
  const setups = useStoreSnapshot((state) => {
    const { userSetups = [] } = state.userdb;

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
