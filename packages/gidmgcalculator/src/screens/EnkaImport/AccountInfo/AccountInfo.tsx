import { Button, clsx, Skeleton } from "rond";
import { useDataImportState } from "../DataImportProvider/context";
import { FaCaretRight } from "react-icons/fa";

type AccountInfoProps = {
  className?: string;
  isMobile?: boolean;
  onSeeBuilds?: () => void;
};

export function AccountInfo({ className, isMobile, onSeeBuilds }: AccountInfoProps) {
  const { data: genshinUser, isLoading, error } = useDataImportState();
  const cls = ["p-3 rounded bg-dark-1", className];

  if (isLoading) {
    return (
      <div className={clsx(cls)}>
        <div className="h-8 flex items-center">
          <Skeleton className="w-24 h-6 rounded-sm" />
        </div>
        <div className="h-6 flex items-center">
          <Skeleton className="w-8/10 h-4 rounded-sm" />
        </div>
      </div>
    );
  }

  if (genshinUser) {
    return (
      <div className={clsx(cls)}>
        <p>
          <span className="text-2xl font-bold">{genshinUser.name}</span>
          <span className="text-xl text-light-4"> | AR {genshinUser.level}</span>
        </p>
        <p className="text-light-hint">{genshinUser.signature}</p>

        {isMobile && (
          <div className="mt-3 flex justify-end">
            <Button icon={<FaCaretRight className="text-2xl" />} onClick={onSeeBuilds} />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(cls, "flex-center")}>
        <p className="py-4 text-danger-2">{error.message}</p>
      </div>
    );
  }
}
