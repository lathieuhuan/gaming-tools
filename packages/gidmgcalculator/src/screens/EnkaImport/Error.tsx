import { FallbackProps } from "react-error-boundary";
import { Button } from "rond";

export function Error({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="h-full pt-8 flex justify-center bg-dark-2">
      <div className="max-w-80 px-4 flex flex-col items-center">
        <p className="text-2xl font-bold text-danger-2">Error</p>
        <p className="mb-2 text-center">
          If the error persists after you reset, please help me by reporting it.
        </p>
        <Button onClick={resetErrorBoundary}>Reset</Button>
      </div>
    </div>
  );
}
