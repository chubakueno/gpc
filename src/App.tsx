import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Navbar } from "@/components/layout/Navbar";

const HomePage = lazy(() => import("@/pages/HomePage"));
const HashingPage = lazy(() => import("@/components/hashing/HashingPage"));
const UFDSPage = lazy(() => import("@/components/ufds/UFDSPage"));
const MSTPage  = lazy(() => import("@/components/mst/MSTPage"));
const TriePage = lazy(() => import("@/components/trie/TriePage"));

function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64 text-[var(--color-muted)]">
            Loading…
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/hashing", element: <HashingPage /> },
      { path: "/ufds", element: <UFDSPage /> },
      { path: "/mst",  element: <MSTPage /> },
      { path: "/trie", element: <TriePage /> },
    ],
  },
]);

export function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
