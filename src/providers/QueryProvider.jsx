import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
export function QueryProvider({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: true,
            },
        },
    }));
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
