// @ts-nocheck
 
 
/// <reference types="cypress" />

describe('Ticker selection flow', () => {
  it('searches MSFT ticker and loads StockPage', () => {
    cy.visit('http://localhost:8083');

    // Type ticker in search bar and press enter
    cy.get('input[placeholder="Search stocks, news, or ask AI..."]').type('MSFT{enter}');

    // URL should update to stock page
    cy.url().should('include', '/stock/MSFT');

    // Critical bubbles should appear
    cy.contains('Company Overview').should('be.visible');
    cy.contains('Financial Metrics').should('be.visible');
  });
}); 