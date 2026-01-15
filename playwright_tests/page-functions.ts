import { Page, expect } from '@playwright/test';
import { config, selectors } from './test-config';

/* ================= NAVIGATION ================= */

export async function goto(
  page: Page,
  url: string = config.baseUrl
): Promise<void> {
  await page.goto(url);
}

/* ================= AUTH ================= */

export async function connect(
  page: Page,
  user = config.users.standard
): Promise<void> {
  await goto(page);
  await page.fill(selectors.username, user.username);
  await page.fill(selectors.password, user.password);
  await page.click(selectors.loginButton);
  await expect(page).toHaveURL(/inventory.html/);
}

export async function logout(page: Page): Promise<void> {
  await page.click('#react-burger-menu-btn');
  await page.click('#logout_sidebar_link');
}

/* ================= PRODUCTS ================= */

export async function addToCart(
  page: Page,
  product: string
): Promise<void> {
  await page.click(selectors.addToCart(product));
}

export async function sortProducts(
  page: Page,
  option: string
): Promise<void> {
  await page.selectOption(selectors.sortDropdown, option);
}

export async function getProductPrices(page: Page): Promise<number[]> {
  const prices = await page.locator(selectors.inventoryPrice).allTextContents();
  return prices.map(p => Number(p.replace('$', '')));
}

export async function verifyAscendingPrices(page: Page): Promise<void> {
  const prices = await getProductPrices(page);
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
}

export async function verifyDescendingPrices(page: Page): Promise<void> {
  const prices = await getProductPrices(page);
  expect(prices).toEqual([...prices].sort((a, b) => b - a));
}

/* ================= CART ================= */

export async function goToCart(page: Page): Promise<void> {
  await page.click(selectors.cartLink);
}

export async function checkCartHasItems(
  page: Page,
  count: number
): Promise<void> {
  await expect(page.locator(selectors.cartItem)).toHaveCount(count);
}

export async function clearCart(page: Page): Promise<void> {
  const buttons = await page.locator('[data-test^="remove-"]').all();
  for (const btn of buttons) {
    await btn.click();
  }
}

/* ================= CHECKOUT ================= */

export async function startCheckout(page: Page): Promise<void> {
  await page.click(selectors.checkoutButton);
}

export async function fillShippingInfo(
  page: Page,
  firstName: string,
  lastName: string,
  postalCode: string
): Promise<void> {
  await page.fill(selectors.firstName, firstName);
  await page.fill(selectors.lastName, lastName);
  await page.fill(selectors.postalCode, postalCode);
}

export async function continueCheckout(page: Page): Promise<void> {
  await page.click(selectors.continueButton);
}

export async function finishCheckout(page: Page): Promise<void> {
  await page.click(selectors.finishButton);
}

export async function checkOrderConfirmation(page: Page): Promise<void> {
  await expect(page.locator(selectors.completeHeader))
    .toHaveText('Thank you for your order!');
}

export async function checkCartIsEmpty(page: Page): Promise<void> {
  await expect(page.locator(selectors.cartBadge)).toHaveCount(0);
}

/* ================= UTIL ================= */

export async function takeScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `${config.paths.screenshots}${name}.png`,
  });
}
