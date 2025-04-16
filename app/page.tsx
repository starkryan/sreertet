import React from 'react'
import { Hero } from '@/components/ui/animated-hero'
import DisplayCards from '@/components/ui/display-cards'
import { Footerdemo } from '@/components/ui/footer-section'
import { Navbar1 } from '@/components/blocks/shadcnblocks-com-navbar1';

export default function HomePage() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar1 />
      <main className='flex-1'>
        <Hero />
        <div className='container mx-auto px-4 mb-20 sm:mb-40'>
          <DisplayCards />
        </div>
      </main>
      <Footerdemo />
    </div>
  )
}