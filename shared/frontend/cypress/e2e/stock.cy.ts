/// <reference types="cypress" />

describe('Stock page basic flow', () => {
  it('loads AAPL by default and shows bubbles', () => {
    cy.visit('http://localhost:8083/stock/AAPL');
    cy.contains('AI Chat Assistant');
    cy.contains('Company Overview');
  });

  it('shows error for invalid ticker', () => {
    cy.visit('http://localhost:8083/stock/INVALID');
    cy.contains('Error').should('exist');
  });
}); 