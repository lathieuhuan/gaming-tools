import { LoadingSpin } from "../LoadingSpin";

import "./styles.scss";

export function LoadingPlate() {
  return (
    <div className="ron-flex-center ron-loading-plate">
      <LoadingSpin size="large" />
    </div>
  );
}
