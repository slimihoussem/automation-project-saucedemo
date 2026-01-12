import { test, expect, BrowserContext, Page } from '@playwright/test';

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
  // 1️⃣ Hook beforeAll : connexion utilisateur standard
  context = await browser.newContext();
  page = await context.newPage();

  await page.goto('https://www.saucedemo.com/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory.html/);
});

test.afterAll(async () => {
  await context.close();
});

test('Processus de paiement complet', async () => {

  // 2️⃣ Ajouter un produit au panier
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

  // 3️⃣ Aller dans le panier
  await page.click('.shopping_cart_link');
  await expect(page.locator('.cart_item')).toHaveCount(1);

  // 4️⃣ Cliquer sur "Checkout"
  await page.click('[data-test="checkout"]');

  // 5️⃣ Remplir le formulaire
  await page.fill('[data-test="firstName"]', 'Test');
  await page.fill('[data-test="lastName"]', 'User');
  await page.fill('[data-test="postalCode"]', '12345');

  // 6️⃣ Cliquer sur "Continue"
  await page.click('[data-test="continue"]');

  // 7️⃣ Vérifier la page de récapitulatif
  await expect(page).toHaveURL(/checkout-step-two.html/);
  await expect(page.locator('.summary_info')).toBeVisible();
  await expect(page.locator('.inventory_item_name'))
    .toHaveText('Sauce Labs Backpack');

  // 8️⃣ Cliquer sur "Finish"
  await page.click('[data-test="finish"]');

  // 9️⃣ Vérifier le message de confirmation
  await expect(page.locator('.complete-header'))
    .toHaveText('Thank you for your order!');

  // 🔟 Vérifier que le badge du panier n'est plus visible
  await expect(page.locator('.shopping_cart_badge'))
    .toHaveCount(0);
});
