// @ts-ignore – types are provided via Cypress toolchain
import { defineConfig } from 'cypress';
// @ts-ignore – no types publish for plugin
import codeCoverage from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8083',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
       
      codeCoverage(on, config);
      return config;
    },
  },
}); 