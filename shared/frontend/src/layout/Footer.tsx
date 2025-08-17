import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300" role="contentinfo" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
        {/* Top grid – szimmetria: négy azonos szélességű oszlop, egységes heading baseline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          <nav aria-label="Products" className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">Products</h3>
            <ul className="space-y-2 text-sm">
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/stock/AAPL">Stocks</a></li>
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/macro">Macro Rates</a></li>
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/news">News</a></li>
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/ai-hub">AI Hub</a></li>
            </ul>
          </nav>

          <nav aria-label="Resources" className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">Resources</h3>
            <ul className="space-y-2 text-sm">
              {!(import.meta as any).env?.DEV && (
                <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/docs">Documentation</a></li>
              )}
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/status">System status</a></li>
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/contact">Contact</a></li>
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/security">Security</a></li>
            </ul>
          </nav>

          <nav aria-label="Legal" className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/legal/privacy">Privacy</a></li>
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/legal/terms">Terms</a></li>
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/cookies">Cookies</a></li>
              <li><a className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded" href="/accessibility">Accessibility</a></li>
            </ul>
          </nav>

          <div aria-label="Language and social" className="space-y-3 justify-self-end lg:justify-self-auto">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">Language</h3>
            {/* Accessible radiogroup – vizuálisan badge gombok, egységes méret */}
            <fieldset role="radiogroup" aria-labelledby="lang-label" className="mt-3">
              <legend id="lang-label" className="sr-only">Change language</legend>
              <div className="inline-flex overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
                {/* EN */}
                <label className="relative inline-flex h-11 min-w-[56px] cursor-pointer select-none items-center justify-center px-3 text-xs font-semibold uppercase tracking-wide text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500/40">
                  <input type="radio" name="language" value="en" defaultChecked className="sr-only" aria-label="English" onChange={() => { /* i18n.changeLanguage('en') */ }} />
                  EN
                </label>
                {/* HU */}
                <label className="relative inline-flex h-11 min-w-[56px] cursor-pointer select-none items-center justify-center px-3 text-xs font-semibold uppercase tracking-wide text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500/40 border-l border-neutral-200 dark:border-neutral-800">
                  <input type="radio" name="language" value="hu" className="sr-only" aria-label="Magyar" onChange={() => { /* i18n.changeLanguage('hu') */ }} />
                  HU
                </label>
              </div>
            </fieldset>

            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 mt-6">Follow</h3>
            <div className="mt-3 flex items-center gap-4">
              <a href="https://www.linkedin.com" aria-label="LinkedIn" className="p-2 rounded hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5zM4 8.98h2v12H4v-12zM9 8.98h1.92v1.64h.03c.27-.5.94-1.03 1.93-1.03 2.06 0 2.44 1.36 2.44 3.14v8.25h-2v-7.31c0-1.74-.03-3.98-2.43-3.98-2.44 0-2.81 1.9-2.81 3.86v7.43H9v-12z"/></svg>
              </a>
              <a href="https://x.com" aria-label="X" className="p-2 rounded hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M18.244 2H21l-6.53 7.46L22.5 22H15.6l-4.59-6.34L5.6 22H3l7.06-8.06L1.5 2H8.4l4.13 5.86L18.244 2z"/></svg>
              </a>
              <a href="https://github.com" aria-label="GitHub" className="p-2 rounded hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.14 8.96 7.49 10.41.55.1.75-.23.75-.52v-1.9c-3.05.66-3.69-1.3-3.69-1.3-.5-1.26-1.22-1.6-1.22-1.6-.99-.68.08-.67.08-.67 1.1.08 1.68 1.14 1.68 1.14.98 1.68 2.57 1.2 3.2.92.1-.72.38-1.2.69-1.48-2.43-.28-4.98-1.22-4.98-5.45 0-1.2.43-2.18 1.14-2.95-.12-.28-.49-1.43.11-2.98 0 0 .93-.3 3.05 1.13a10.6 10.6 0 0 1 5.56 0c2.12-1.44 3.04-1.13 3.04-1.13.6 1.55.23 2.7.11 2.98.71.77 1.14 1.75 1.14 2.95 0 4.24-2.55 5.16-4.99 5.43.39.34.73 1 .73 2.02v2.99c0 .3.2.63.75.52A10.99 10.99 0 0 0 23 11.5C23 5.24 18.27.5 12 .5z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">Aevorex</span>
            <span>© {year} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
            <a href="/sitemap" className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded">Sitemap</a>
            <a href="/contact" className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/40 rounded">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;