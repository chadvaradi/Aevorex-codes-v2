import React from 'react';

const BrandingPage: React.FC = () => {
  return (
    <div>
      {/* Hero */}
      <section id="hero" className="relative overflow-hidden">
        {/* Aurora/spotlight background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40" style={{background: 'radial-gradient(60% 50% at 10% 10%, rgba(37,99,235,.25), transparent 60%), radial-gradient(50% 40% at 90% 20%, rgba(56,189,248,.25), transparent 60%), radial-gradient(40% 30% at 50% 90%, rgba(59,130,246,.2), transparent 60%)'}} />
        <div className="mx-auto max-w-7xl px-4 py-24 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-4">Enterprise • Live</div>
            <h1 className="display-serif text-5xl md:text-6xl font-semibold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 text-balance">Research‑grade AI, operated by you.</h1>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300 max-w-prose">Integrált AI platform. Pénzügy, Egészség, Tartalom – egy rendszerben, kompromisszumok nélkül.</p>
            <div className="mt-6 flex items-center gap-3">
              <a href="/api/v1/auth/login?redirect=1&next=/" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors text-sm">Google bejelentkezés</a>
              <a href="#features" className="px-4 py-2 rounded-md border border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 text-sm">Funkciók</a>
            </div>
            <p className="mt-6 text-neutral-600 dark:text-neutral-300 text-sm">Mottó: <span className="italic">Aevo et Rex</span> — növekedés és vezetés.</p>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 p-6 shadow-sm">
            {/* Product tour placeholder – később WebM */}
            <div className="aspect-[16/10] rounded-lg bg-gradient-to-br from-primary/20 to-sky-300/20 dark:from-primary/10 dark:to-sky-400/10 shimmer" />
          </div>
        </div>
      </section>

      {/* Trust strip – Alma Mater logók */}
      <section className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-center text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-6">Alma mater</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 place-items-center opacity-70">
            <img src="/assets/partners/bocconi.svg" alt="Bocconi University" className="h-8 md:h-10" />
            <img src="/assets/partners/upenn.svg" alt="University of Pennsylvania" className="h-8 md:h-10" />
            <img src="/assets/partners/semmelweis.svg" alt="Semmelweis University" className="h-8 md:h-10" />
            <div className="text-sm text-neutral-500 dark:text-neutral-400">…</div>
          </div>
          <p className="text-center text-[11px] text-neutral-500 dark:text-neutral-400 mt-4">Ahol a készítők végeztek</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="display-serif text-3xl font-semibold text-neutral-900 dark:text-neutral-50">Modulok</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">Finance, Health, Content és AI – egységes architektúrában.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { t: 'Finance HUB', d: 'Equity research, TradingView, AI summaries', href: '/stock/AAPL' },
              { t: 'Macro Rates', d: 'ECB/BUBOR fixings, yield curve', href: '/macro' },
              { t: 'News', d: 'Market news pipeline', href: '/news' },
            ].map((x) => (
              <a key={x.t} href={x.href} className="block rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:border-primary/40 transition-colors will-change-transform transform transition-transform duration-150 hover:-translate-y-0.5">
                <div className="text-base font-medium text-neutral-900 dark:text-neutral-100">{x.t}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{x.d}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Live demos */}
      <section id="live-demos" className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Élő demók</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <a href="/stock/AAPL" className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:border-primary/40 transition-colors">
              <div className="text-neutral-900 dark:text-neutral-100 font-medium">Finance HUB</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">Equity research + AI</div>
            </a>
            <a href="/macro" className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 hover:border-primary/40 transition-colors">
              <div className="text-neutral-900 dark:text-neutral-100 font-medium">Macro Rates</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">ECB/BUBOR</div>
            </a>
          </div>
        </div>
      </section>

      {/* Why it works / Testimonials (proof) */}
      <section id="testimonials" className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="display-serif text-3xl font-semibold text-neutral-900 dark:text-neutral-50">Miért működik</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { h: 'Gyors bevezetés', p: '2 hét alatt éles, integrációs pokol nélkül.' },
              { h: 'Bloomberg‑szint élmény', p: 'Equity research élmény prémium UI‑val.' },
              { h: 'Valódi eredmény', p: 'AI‑összefoglalók percek alatt döntéstámogatássá válnak.' },
            ].map((x, i) => (
              <div key={i} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                <div className="text-neutral-900 dark:text-neutral-100 font-medium">{x.h}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{x.p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (visual placeholder) */}
      <section id="pricing" className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Árazás</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              { t: 'Starter', p: '€2,000/mo', f: ['Alap modulok', 'Support'] },
              { t: 'Enterprise', p: '€5,000+/mo', f: ['Minden modul', 'Prior support'] },
            ].map((x) => (
              <div key={x.t} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
                <div className="text-neutral-900 dark:text-neutral-100 font-medium">{x.t}</div>
                <div className="text-xl font-semibold mt-1 text-neutral-900 dark:text-neutral-50">{x.p}</div>
                <ul className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 list-disc list-inside">
                  {x.f.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Mottó (Aevorex = aevo + rex) */}
      <section id="contact" className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-16 grid gap-6 md:grid-cols-[1fr_auto] items-center">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">Készen állsz a következő szintre?</h3>
            <p className="mt-1 text-neutral-600 dark:text-neutral-300">Enterprise demo kérése, integrációs terv és ütemezés.</p>
            <p className="mt-3 text-neutral-600 dark:text-neutral-300 text-sm italic">Mottó: "Aevo et Rex" – növekedés és vezetés (felemelkedés és uralom).</p>
          </div>
          <a href="mailto:sales@aevorex.com" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors text-sm">Enterprise Demo</a>
        </div>
      </section>
    </div>
  );
};

export default BrandingPage;


