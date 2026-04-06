"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { FormProvider } from "@/context/FormContext";
import { FormResultsProvider } from "@/context/FormResultsContext";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <FormResultsProvider>
        <FormProvider>{children}</FormProvider>
      </FormResultsProvider>
    </QueryClientProvider>
  );
}
