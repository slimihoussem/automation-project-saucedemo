import { test, expect, BrowserContext, Page } from '@playwright/test';

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext();
  page = await context.newPage();

  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory.html/);
});

test.afterAll(async () => {
  await context.close();
});

test('Processus de paiement complet', async () => {

  // Ajouter un produit
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

  // Aller au panier
  await page.locator('.shopping_cart_link').click();
  await expect(page.locator('.cart_item')).toHaveCount(1);

  // Checkout
  await page.locator('[data-test="checkout"]').click();

  // Formulaire
  await page.fill('[data-test="firstName"]', 'Test');
  await page.fill('[data-test="lastName"]', 'User');
  await page.fill('[data-test="postalCode"]', '12345');

  await page.locator('[data-test="continue"]').click();

  // Vérification récapitulatif
  await expect(page).toHaveURL(/checkout-step-two.html/);
  await expect(page.locator('.summary_info')).toBeVisible();
  await expect(page.locator('.inventory_item_name'))
    .toHaveText(/Sauce Labs Backpack/);

  // Finish
  await page.locator('[data-test="finish"]').click();

  // Confirmation
  await expect(page.locator('.complete-header'))
    .toHaveText('Thank you for your order!');

  // Panier vide
  await expect(page.locator('.shopping_cart_badge'))
    .toHaveCount(0);
});
