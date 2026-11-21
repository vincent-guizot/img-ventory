import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";

export function renderWithProviders(element, { path = "/", route = "/", search = "" } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      {
        element: <Outlet context={{ search }} />,
        children: [
          { path, element },
          { path: "*", element: <div>other route</div> },
        ],
      },
    ],
    { initialEntries: [route] },
  );
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...utils, queryClient, router };
}
