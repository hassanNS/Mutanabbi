import React, { Component } from 'react'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ThemeToggle'


export default function AppHeader() {
  return (
      <header className="w-full fixed left-0 top-0 shadow-md bg-slate-200 dark:bg-slate-700">
        <div className="flex flex-row justify-between items-center w-full h-14 px-4">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              <Image
                src="/logo.svg"
                alt="Mutanabbi Logo"
                width={40}
                height={40}
                quality={95}
                priority={true}
                className="logo-image"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold">Mutanabbi</h1>
              <p className="text-xs sm:text-sm hidden sm:block" style={{ color: 'var(--text-subtle)'}}>
                Improve your Arabic composition
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>
  )
}

