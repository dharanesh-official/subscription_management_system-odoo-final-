
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import { LandingHero } from '@/components/landing-hero'
import { FeaturesGrid } from '@/components/features-grid'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="mr-8 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <div className="h-8 w-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white dark:text-black fill-current" />
              </div>
              <span className="hidden font-bold sm:inline-block text-lg">
                SubCheck
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#features">Features</Link>
              <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="#pricing">Pricing</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <LandingHero />
        <FeaturesGrid />
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by <strong>Dharanesh and Team</strong>.
          </p>
        </div>
      </footer>
    </div>
  )
}
