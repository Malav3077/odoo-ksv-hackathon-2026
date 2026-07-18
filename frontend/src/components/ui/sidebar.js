'use client'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_ICON = '3rem'

const SidebarContext = React.createContext(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

function SidebarProvider({ defaultOpen = true, children, className, style, ...props }) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)

  const setOpen = React.useCallback((value) => {
    const next = typeof value === 'function' ? value(_open) : value
    _setOpen(next)
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${60 * 60 * 24 * 7}`
  }, [_open])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile(o => !o)
    else setOpen(o => !o)
  }, [isMobile, setOpen])

  const open = isMobile ? true : _open
  const state = open ? 'expanded' : 'collapsed'

  const ctx = React.useMemo(() => ({
    state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar,
  }), [state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar])

  return (
    <SidebarContext.Provider value={ctx}>
      <div
        data-sidebar="provider"
        style={{ '--sidebar-width': SIDEBAR_WIDTH, '--sidebar-width-icon': SIDEBAR_WIDTH_ICON, ...style }}
        className={cn('flex min-h-svh w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button variant="ghost" size="icon"
      className={cn('size-7 text-muted-foreground', className)}
      onClick={(e) => { onClick?.(e); toggleSidebar() }} {...props}>
      <PanelLeft className="size-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

function Sidebar({ collapsible = 'offcanvas', variant = 'sidebar', side = 'left', className, children, ...props }) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side={side} className="w-[var(--sidebar-width)] p-0 [&>button]:hidden">
          <div data-sidebar="sidebar" className="flex h-full flex-col">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      className={cn(
        'group/sidebar-wrapper relative flex h-svh flex-col transition-[width] duration-200 ease-linear',
        'w-[var(--sidebar-width)]',
        state === 'collapsed' && collapsible === 'icon' && 'w-[var(--sidebar-width-icon)]',
        'border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        variant === 'inset' && 'shadow-[inset_-1px_0_0_var(--sidebar-border)]',
        className
      )} {...props}>
      <div data-sidebar="sidebar" className={cn('flex h-full flex-col overflow-hidden', className)}>
        {children}
      </div>
    </div>
  )
}

function SidebarInset({ className, ...props }) {
  return (
    <main className={cn('relative flex flex-1 flex-col overflow-auto bg-background', className)} {...props} />
  )
}

function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      data-sidebar="rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn('absolute inset-y-0 right-0 z-20 hidden w-1 -translate-x-1/2 transition-all duration-200 ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-2 group-data-[side=right]:left-0 sm:flex', className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }) {
  return <div data-sidebar="header" className={cn('flex flex-col gap-2 p-2', className)} {...props} />
}

function SidebarFooter({ className, ...props }) {
  return <div data-sidebar="footer" className={cn('flex flex-col gap-2 p-2', className)} {...props} />
}

function SidebarContent({ className, ...props }) {
  return (
    <div data-sidebar="content"
      className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden', className)}
      {...props} />
  )
}

function SidebarSeparator({ className, ...props }) {
  return <Separator data-sidebar="separator" className={cn('mx-2 w-auto bg-sidebar-border', className)} {...props} />
}

function SidebarGroup({ className, ...props }) {
  return (
    <div data-sidebar="group" className={cn('relative flex w-full min-w-0 flex-col p-2', className)} {...props} />
  )
}

function SidebarGroupLabel({ className, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp data-sidebar="group-label"
      className={cn('flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/60 outline-none transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0', className)}
      {...props} />
  )
}

function SidebarGroupContent({ className, ...props }) {
  return <div data-sidebar="group-content" className={cn('w-full text-sm', className)} {...props} />
}

function SidebarMenu({ className, ...props }) {
  return <ul data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-0.5', className)} {...props} />
}

function SidebarMenuItem({ className, ...props }) {
  return <li data-sidebar="menu-item" className={cn('group/menu-item relative', className)} {...props} />
}

const SidebarMenuButton = React.forwardRef(({
  asChild = false, isActive = false, tooltip, size = 'default', className, ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button'
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp ref={ref} data-sidebar="menu-button" data-size={size} data-active={isActive}
      className={cn(
        'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
        size === 'lg' && 'h-12 text-sm',
        size === 'sm' && 'h-7 text-xs',
        'group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2 [&>span:last-child]:group-data-[collapsible=icon]:hidden',
        className
      )} {...props} />
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" hidden={state !== 'collapsed' || isMobile}>
        {typeof tooltip === 'string' ? tooltip : tooltip}
      </TooltipContent>
    </Tooltip>
  )
})
SidebarMenuButton.displayName = 'SidebarMenuButton'

function SidebarMenuBadge({ className, ...props }) {
  return (
    <div data-sidebar="menu-badge"
      className={cn('absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1 text-[10px] font-medium tabular-nums text-sidebar-primary-foreground', className)}
      {...props} />
  )
}

function SidebarInput({ className, ...props }) {
  return (
    <input data-sidebar="input"
      className={cn('h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring', className)}
      {...props} />
  )
}

export {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar,
}
