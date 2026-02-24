import { useEnkaUser } from "../hooks/useEnkaUser";

type ProfileInfoProps = {
  profile?: string;
};

export function ProfileInfo({ profile }: ProfileInfoProps) {
  const { data: enkaUser, isLoading, isError, error } = useEnkaUser(profile);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (enkaUser) {
    return <div>{enkaUser.profile}</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return null;
}
