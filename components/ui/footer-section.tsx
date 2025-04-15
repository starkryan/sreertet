"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

function Footerdemo() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <footer className="relative border-t bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Theme</h3>
            <Button 
              variant="outline" 
              onClick={toggleDarkMode}
              className="hover:text-primary"
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </Button>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              <a href="/" className="block hover:text-primary">
                Home
              </a>
              <a href="/pricing" className="block hover:text-primary">
                Pricing
              </a>
            </nav>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-4 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Company Name. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }