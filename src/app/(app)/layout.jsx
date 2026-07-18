import { cookies } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Authenticated application shell: persistent sidebar + top navbar + footer.
 *
 * Lives in the `(app)` route group so future public routes (auth, marketing)
 * can opt out of the shell by sitting outside this group.
 */
export default async function AppLayout({
  children,
}) {
  // Restore the user's sidebar collapsed/expanded preference on the server
  // to avoid a layout flash on first paint.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
