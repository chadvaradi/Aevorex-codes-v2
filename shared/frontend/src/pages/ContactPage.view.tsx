import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Kapcsolat</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">Lépj velünk kapcsolatba az alábbi elérhetőségeken.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[160px_1fr] items-start">
        <div className="w-40 h-40 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 overflow-hidden grid place-items-center text-neutral-400">
          {/* Személyes fotó helye – később cserélhető */}
          <span className="text-xs">Személyes fotó</span>
        </div>
        <div>
          <div className="text-neutral-700 dark:text-neutral-300"><span className="font-medium">E-mail:</span> <a className="text-primary hover:underline" href="mailto:info@aevorex.com">info@aevorex.com</a></div>
          <div className="text-neutral-700 dark:text-neutral-300 mt-1"><span className="font-medium">Telefon:</span> <a className="text-primary hover:underline" href="tel:+36309392194">+36 30 939 2194</a></div>

          <form className="mt-6 grid gap-3 max-w-lg" onSubmit={(e) => { e.preventDefault(); alert('Köszönjük, hamarosan jelentkezünk.'); }}>
            <input className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" placeholder="Neved" required />
            <input type="email" className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm" placeholder="E-mail címed" required />
            <textarea className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm min-h-[120px]" placeholder="Üzenet" required />
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Az űrlap elküldésével elfogadod az adatkezelési tájékoztatót.</div>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors text-sm w-max">Küldés</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;



