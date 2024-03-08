describe('MainLayout Component Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the main layout successfully', () => {
    cy.get('[data-testid="main-layout"]').should('exist');
  });

  it('displays model cards', () => {
    // Проверяем, что карточки моделей существуют и видны
    // Допустим, что карточки моделей имеют атрибут data-testid="model-card"
    cy.get('[data-testid="model-card"]').should('be.visible').and('have.length.at.least', 1);
  });
  it('handles pagination correctly', () => {
    // Проверяем, что пагинация отображается
    cy.get('[data-testid="pagination"]').should('exist');

    // Запоминаем данные первой страницы (например, первую карточку модели)
    cy.get('[data-testid="model-card"]').first().invoke('text').then((text1) => {
      // Переходим на следующую страницу
      cy.get('[data-testid="pagination"]').find('button').contains('2').click();

      // Проверяем, что данные изменились
      cy.get('[data-testid="model-card"]').first().invoke('text').should((text2) => {
        expect(text1).not.to.eq(text2);
      });
    });
  });
  it('can switch tabs', () => {
    const tabName = 'Text Generation'; 
    cy.get('[data-testid="tabs"]', { timeout: 10000 }).contains(tabName).click({ force: true });
    cy.get('[data-testid="tabs"]', { timeout: 10000 }).contains(tabName).should('have.class', 'Mui-selected');
  });
});