import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { FormProvider } from "./context/FormContext.tsx";
import { FormResultsProvider } from "./context/FormResultsContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FormResultsProvider>
          <FormProvider>
            <App />
          </FormProvider>
        </FormResultsProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
