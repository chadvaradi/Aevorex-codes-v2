// @ts-nocheck
/// <reference types="cypress" />

describe('Macro Rates page flow', () => {
  it('renders UST yield curve and forex pair widgets', () => {
    cy.visit('http://localhost:8083/macro');

    cy.contains('UST Yield Curve').should('be.visible');
    cy.contains('Forex Pair').should('be.visible');
  });
}); 