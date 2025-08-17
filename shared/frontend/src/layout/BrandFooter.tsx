import React from 'react';

const BrandFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-5 text-sm">
        <div>
          <div className="text-neutral-900 dark:text-neutral-100 font-semibold">AEVOREX</div>
          <div className="text-neutral-500 dark:text-neutral-400 mt-2">Enterprise Intelligence Platform</div>
          {/* Socials (icons) */}
          <div className="mt-4 flex items-center gap-4 text-neutral-500 dark:text-neutral-400">
            <a href="https://www.linkedin.com/company/aevorex" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-smooth">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" role="img"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM14.5 9c-2.21 0-3.5 1.2-3.5 3.07V21h4v-7.06c0-1.03.74-1.94 2-1.94 1.2 0 2 .82 2 1.94V21h4v-7.5C23 10.57 21.43 9 19 9c-1.52 0-2.62.62-3.11 1.42h-.05V9h-1.34Z"/></svg>
            </a>
            <a href="https://twitter.com/aevorex" target="_blank" rel="noreferrer" aria-label="Twitter/X" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-smooth">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" role="img"><path d="M3 3h4.6l5.2 7.2L18.4 3H22l-7.9 10.7L21 21h-4.6l-5.6-7.7L7 21H3l8-10.8L3 3Z"/></svg>
            </a>
            <a href="https://github.com/aevorex" target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-smooth">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" role="img"><path d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.23 3.4 9.66 8.13 11.23.6.11.82-.26.82-.58v-2.2c-3.3.73-4-1.44-4-1.44-.55-1.4-1.34-1.77-1.34-1.77-1.1-.76.08-.75.08-.75 1.2.09 1.83 1.25 1.83 1.25 1.08 1.9 2.84 1.35 3.54 1.03.11-.8.42-1.35.76-1.66-2.64-.31-5.42-1.36-5.42-6.05 0-1.34.46-2.43 1.23-3.29-.12-.31-.53-1.57.12-3.27 0 0 1-.33 3.3 1.25a11.3 11.3 0 0 1 6 0c2.3-1.58 3.3-1.25 3.3-1.25.65 1.7.24 2.96.12 3.27.77.86 1.23 1.95 1.23 3.29 0 4.7-2.79 5.73-5.45 6.04.43.38.81 1.12.81 2.26v3.35c0 .33.21.7.83.58A11.5 11.5 0 0 0 23.5 12.3 11.5 11.5 0 0 0 12 .5Z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <div className="text-neutral-800 dark:text-neutral-200 font-medium mb-2">Modules</div>
          <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
            <li><a href="/stock/AAPL" className="hover:text-neutral-900 dark:hover:text-neutral-100">Finance Hub</a></li>
            <li><a href="/macro" className="hover:text-neutral-900 dark:hover:text-neutral-100">Macro Rates</a></li>
            <li><a href="/news" className="hover:text-neutral-900 dark:hover:text-neutral-100">News</a></li>
          </ul>
        </div>
        <div>
          <div className="text-neutral-800 dark:text-neutral-200 font-medium mb-2">Company</div>
          <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
            <li><a href="/contact" className="hover:text-neutral-900 dark:hover:text-neutral-100">Contact</a></li>
            <li><a href="#careers" className="hover:text-neutral-900 dark:hover:text-neutral-100">Careers</a></li>
          </ul>
        </div>
        <div>
          <div className="text-neutral-800 dark:text-neutral-200 font-medium mb-2">Legal</div>
          <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
            <li><a href="/pages/legal/privacy.html" className="hover:text-neutral-900 dark:hover:text-neutral-100">Privacy</a></li>
            <li><a href="/pages/legal/terms.html" className="hover:text-neutral-900 dark:hover:text-neutral-100">Terms</a></li>
          </ul>
        </div>
        {/* Newsletter – első sorban, a Legal mellett */}
        <div>
          <div className="text-neutral-800 dark:text-neutral-200 font-medium mb-2">Feliratkozás</div>
          <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget as HTMLFormElement; const input = form.querySelector('input[type=email]') as HTMLInputElement | null; if (input?.value) { try { localStorage.setItem('newsletter_email', input.value); } catch {} input.value=''; alert('Köszönjük a feliratkozást!'); } }}>
            <input type="email" required placeholder="E-mail címed" className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm flex-1" />
            <button type="submit" className="px-3 py-2 rounded-md bg-primary text-white text-sm hover:bg-primary/90">Feliratkozom</button>
          </form>
        </div>
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
          <span>© {new Date().getFullYear()} AEVOREX. All rights reserved.</span>
          <span>All systems operational</span>
        </div>
      </div>
    </footer>
  );
};

export default BrandFooter;


