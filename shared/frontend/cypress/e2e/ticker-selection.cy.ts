// @ts-nocheck
 
 
/// <reference types="cypress" />

describe('Ticker selection flow', () => {
  it('navigates to MSFT StockPage and renders bubbles', () => {
    cy.visit('http://localhost:8083/stock/MSFT');
    cy.url().should('include', '/stock/MSFT');
    cy.contains(/Company Overview|Financial Metrics|News Highlights|Technical Analysis/i, { timeout: 15000 }).should('be.visible');
  });
}); 