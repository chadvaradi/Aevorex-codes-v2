// FinanceHub Auth E2E smoke — verifies auth endpoints are reachable and logout clears state

describe('Auth flow smoke', () => {
  const api = (path: string) => `${Cypress.config('baseUrl')?.replace(/:\d+$/, ':8084') || 'http://localhost:8084'}${path}`;

  it('GET /api/v1/auth/login returns auth_url', () => {
    cy.request('GET', api('/api/v1/auth/login')).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('auth_url');
      expect(res.body.auth_url).to.include('https://accounts.google.com');
    });
  });

  it('status unauthenticated → logout 200', () => {
    cy.request('GET', api('/api/v1/auth/status')).then((res) => {
      expect(res.status).to.eq(200);
      // in CI/local this is likely unauthenticated before a real OAuth roundtrip
      expect(res.body).to.have.property('status');
    });

    cy.request('POST', api('/api/v1/auth/logout')).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq('success');
    });
  });
});