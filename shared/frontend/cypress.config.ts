// @ts-ignore – types are provided via Cypress toolchain
import { defineConfig } from 'cypress';
// @ts-ignore – no types publish for plugin (ESM requires explicit extension)
import codeCoverage from '@cypress/code-coverage/task.js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8083',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
       
      codeCoverage(on, config);
      // Register missing no-op task used by some specs
      on('task', {
        prepareArchives() {
          return null;
        },
      });
      return config;
    },
  },
}); 