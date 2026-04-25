import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/i18n";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner.tsx";

// React Query Devtools is a developer-only panel (the flower icon in the
// bottom-right of the screen). We gate it behind `import.meta.env.DEV` so
// Vite tree-shakes both the import and the JSX out of the production
// bundle — saves ~50-80KB gzipped and keeps the debug surface private.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools />
        </Suspense>
      )}
      <Toaster />
      <App />
    </QueryClientProvider>
  </BrowserRouter>,
);
