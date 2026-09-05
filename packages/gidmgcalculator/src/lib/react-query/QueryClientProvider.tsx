import { QueryClientProvider as Provider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return <Provider client={queryClient}>{children}</Provider>;
}
