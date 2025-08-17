/// <reference types="cypress" />

describe('Stock page basic flow', () => {
  it('loads AAPL by default and shows bubbles', () => {
    cy.visit('http://localhost:8083/stock/AAPL');
    cy.contains(/Analysis/i, { timeout: 15000 }).should('be.visible');
    cy.contains(/Company Overview|Financial Metrics|News Highlights|Technical Analysis/i, { timeout: 15000 }).should('be.visible');
  });

  it('handles invalid ticker gracefully (no crash, page renders)', () => {
    cy.visit('http://localhost:8083/stock/INVALID');
    // Page should still render the main sections or fallback skeletons
    cy.contains(/Analysis/i, { timeout: 15000 }).should('exist');
  });
}); 