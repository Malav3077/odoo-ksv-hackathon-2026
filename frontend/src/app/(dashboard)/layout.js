import { cookies } from 'next/headers'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default async function DashboardLayout({ children }) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

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
  )
}
