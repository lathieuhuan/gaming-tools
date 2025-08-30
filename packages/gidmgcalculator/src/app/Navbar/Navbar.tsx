import { useSelector } from "@Store/hooks";
import { selectIsAppReady } from "@Store/ui-slice";

// Components
import { LeftSide } from "./LeftSide";
import { RightSide } from "./RightSide";

export function Navbar() {
  const appReady = useSelector(selectIsAppReady);

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/60 flex justify-between">
      <LeftSide appReady={appReady} />
      <RightSide appReady={appReady} />
    </div>
  );
}
