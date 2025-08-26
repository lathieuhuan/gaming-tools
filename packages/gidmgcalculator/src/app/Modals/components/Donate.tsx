import { useState } from "react";
import { FaCoffee, FaPaypal } from "react-icons/fa";
import { Button, InputNumber, Modal } from "rond";

export function DonateCore() {
  const [usd, setUsd] = useState(1);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center space-x-2">
        <a href={`https://www.paypal.com/paypalme/lathieuhuan/${usd}usd`} target="_blank">
          <Button variant="primary" shape="square" icon={<FaPaypal />} disabled={!usd}>
            Paypal
          </Button>
        </a>
        <InputNumber className="w-12 font-semibold" size="medium" value={usd} min={1} max={999} onChange={setUsd} />
        <span>$</span>
      </div>

      <div className="w-1/2 h-0.5 bg-surface-3 relative">
        <span className="px-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-1">or</span>
      </div>

      <div className="pb-2">
        <a href="https://www.buymeacoffee.com/ronqueroc" target="_blank">
          <Button icon={<FaCoffee />}>Buy me a coffee</Button>
        </a>
      </div>
    </div>
  );
}

export const Donate = Modal.wrap(DonateCore, {
  preset: "small",
  title: <p className="text-center">Donate</p>,
  withHeaderDivider: false,
  className: "bg-surface-1",
});
