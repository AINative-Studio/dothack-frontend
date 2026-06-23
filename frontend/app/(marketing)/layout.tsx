import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 bg-cream border-b-2 border-ink">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="font-archivo font-black text-xl uppercase tracking-tight text-ink hover:text-accent transition-colors"
            >
              DotHack
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-0">
              <Link
                href="/"
                className="font-sans text-sm font-normal text-ink px-4 py-2 hover:text-accent transition-colors"
              >
                Home
              </Link>
              <Link
                href="/features"
                className="font-sans text-sm font-normal text-ink px-4 py-2 hover:text-accent transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="font-sans text-sm font-normal text-ink px-4 py-2 hover:text-accent transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="font-sans text-sm font-normal text-ink px-4 py-2 hover:text-accent transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/contact"
                className="font-sans text-sm font-normal text-ink px-4 py-2 hover:text-accent transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* Right side CTAs */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden md:block font-sans text-sm font-normal text-ink hover:text-accent transition-colors"
              >
                Sign in
              </Link>
              <Link href="/hackathons">
                <Button size="default" variant="default">
                  Open App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-cream-dark border-t-2 border-ink">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Link
              href="/"
              className="font-archivo font-black text-lg uppercase tracking-tight text-ink hover:text-accent transition-colors"
            >
              DotHack
            </Link>

            <div className="flex flex-wrap gap-6">
              <Link href="/features" className="font-sans text-sm text-muted hover:text-ink transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="font-sans text-sm text-muted hover:text-ink transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="font-sans text-sm text-muted hover:text-ink transition-colors">
                Documentation
              </Link>
              <Link href="/contact" className="font-sans text-sm text-muted hover:text-ink transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="font-sans text-sm text-muted hover:text-ink transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="font-sans text-sm text-muted hover:text-ink transition-colors">
                Terms
              </Link>
            </div>

            <p className="font-sans text-sm text-muted">
              &copy; 2025 DotHack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
