import React from 'react';
import { Link } from 'react-router-dom';

const BrandHeader: React.FC = () => {
  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="Aevorex Home">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-sky-400 grid place-items-center text-white font-semibold">A</div>
          <div className="leading-tight">
            <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">AEVOREX</div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Enterprise Intelligence</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">Platform</a>
          <a href="#live-demos" className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">Live Demos</a>
          <a href="#about" className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">About</a>
          <a href="#contact" className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">Contact</a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <a href="#live-demos" className="hidden sm:inline-flex px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors text-sm">Try Live Demo</a>
        </div>
      </div>
    </header>
  );
};

export default BrandHeader;



