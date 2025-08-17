// @ts-nocheck
/// <reference types="cypress" />

describe('Macro Rates page flow', () => {
  it('renders UST yield curve and forex pair widgets', () => {
    cy.visit('http://localhost:8083/macro');
    // Updated headings in UI
    cy.contains('Euro Area Yield Curve').should('be.visible');
    cy.contains('Deviza').should('be.visible');
  });
}); 