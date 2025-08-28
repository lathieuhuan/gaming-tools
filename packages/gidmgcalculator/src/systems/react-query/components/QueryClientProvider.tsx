import { QueryClient, QueryClientProvider as Provider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return <Provider client={queryClient}>{children}</Provider>;
}
