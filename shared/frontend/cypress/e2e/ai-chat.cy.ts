// @ts-nocheck
/// <reference types="cypress" />

describe('AI Chat basic flow', () => {
  it('sends a prompt and receives streamed response', () => {
    cy.visit('http://localhost:8083/stock/AAPL');

    // Ensure AI summary bubble is displayed automatically
    cy.contains('AI Summary').should('exist');

    // Send prompt
    cy.get('textarea[placeholder="Type a message..."]').type('Tell me about Apple earnings prospects{enter}');

    // Expect assistant response to appear (streamed)
    cy.contains('Apple').should('exist');
  });
}); 