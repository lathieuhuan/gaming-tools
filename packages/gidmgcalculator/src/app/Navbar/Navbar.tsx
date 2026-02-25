import { selectAppReady, useUIStore } from "@Store/ui";

// Components
import { LeftSide } from "./LeftSide";
import { RightSide } from "./RightSide";

export function Navbar() {
  const appReady = useUIStore(selectAppReady);

  return (
    <div className="absolute top-0 left-0 right-0 bg-black/60 flex justify-between">
      <LeftSide appReady={appReady} />
      <RightSide appReady={appReady} />
    </div>
  );
}
