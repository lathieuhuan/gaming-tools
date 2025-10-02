import { LoadingSpin } from "../LoadingSpin";

export function LoadingPlate() {
  return (
    <div className="flex-center size-32 bg-black/40 rounded-lg">
      <LoadingSpin size="large" />
    </div>
  );
}
