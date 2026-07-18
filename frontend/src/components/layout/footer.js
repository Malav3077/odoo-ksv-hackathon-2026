import Link from 'next/link'
import { siteConfig } from '@/config/site'

const footerLinks = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 px-4 py-4 md:px-6">
      <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} {siteConfig.name}</span>
          <span className="text-border">•</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            All systems operational
          </span>
        </div>
        <nav className="flex items-center gap-4">
          {footerLinks.map(link => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <span className="font-mono text-[11px] text-muted-foreground/70">v{siteConfig.version}</span>
        </nav>
      </div>
    </footer>
  )
}
