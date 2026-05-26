import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-gradient-warm px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Try again</button>
          <a href="/" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "QuickBite — Hot meals, delivered fast" },
      { name: "description", content: "Order burgers, pizza, pasta, drinks and desserts from QuickBite. Fast delivery, fresh food." },
      { property: "og:title", content: "QuickBite — Hot meals, delivered fast" },
      { name: "twitter:title", content: "QuickBite — Hot meals, delivered fast" },
      { property: "og:description", content: "Order burgers, pizza, pasta, drinks and desserts from QuickBite. Fast delivery, fresh food." },
      { name: "twitter:description", content: "Order burgers, pizza, pasta, drinks and desserts from QuickBite. Fast delivery, fresh food." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7b60b651-a84e-451b-bf96-4a8a69b17d6f/id-preview-ebf811cf--6d737e83-11f7-4545-b7bd-25319ddccada.lovable.app-1779790643922.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7b60b651-a84e-451b-bf96-4a8a69b17d6f/id-preview-ebf811cf--6d737e83-11f7-4545-b7bd-25319ddccada.lovable.app-1779790643922.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  return (
    <QueryClientProvider client={queryClient}>
      {isAdmin ? (
        <>
          <Outlet />
          <Toaster richColors position="top-center" />
        </>
      ) : (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1"><Outlet /></main>
          <Footer />
          <CartDrawer />
          <Toaster richColors position="top-center" />
        </div>
      )}
    </QueryClientProvider>
  );
}
