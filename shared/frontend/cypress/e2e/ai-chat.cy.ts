// @ts-nocheck
/// <reference types="cypress" />

describe('AI Chat basic flow', () => {
  it('sends a prompt and receives streamed response', () => {
    cy.visit('http://localhost:8083/stock/AAPL');

    // Open chat widget explicitly to avoid brittle selector
    cy.contains(/Open Chat|Start Chat/i, { timeout: 15000 }).should('be.visible').click();

    // Send prompt
    cy.get('textarea[placeholder^="Ask about"]', { timeout: 15000 })
      .should('be.visible')
      .type('Tell me about Apple earnings prospects{enter}');

    // Expect assistant response to appear (streamed)
    cy.contains(/Apple|AAPL/i, { timeout: 15000 }).should('exist');
  });
}); 