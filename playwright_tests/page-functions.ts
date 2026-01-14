import { Page } from '@playwright/test';
import { selectors, testData } from './test-config';

/**
 * Performs user login on the SauceDemo application
 * @param {Page} page - Playwright Page object
 * @param {string} [username=testData.standardUser.username] - Username to login with (default: 'standard_user')
 * @param {string} [password=testData.standardUser.password] - Password to login with (default: 'secret_sauce')
 * @returns {Promise<void>}
 * @example
 * // Login with default credentials
 * await login(page);
 * 
 * // Login with custom credentials
 * await login(page, 'problem_user', 'secret_sauce');
 */
export async function login(
  page: Page, 
  username = testData.standardUser.username, 
  password = testData.standardUser.password
): Promise<void> {
  await page.fill(selectors.username, username);
  await page.fill(selectors.password, password);
  await page.click(selectors.loginButton);
}

/**
 * Navigates to a specified URL or the default base URL
 * @param {Page} page - Playwright Page object
 * @param {string} [url=testData.baseUrl] - URL to navigate to (default: '/' or configured baseURL)
 * @returns {Promise<void>}
 * @throws {Error} If navigation fails or URL is invalid
 * @example
 * // Navigate to default URL
 * await goto(page);
 * 
 * // Navigate to specific path
 * await goto(page, '/inventory.html');
 * 
 * // Navigate to full URL
 * await goto(page, 'https://www.saucedemo.com/cart.html');
 */
export async function goto(page: Page, url = testData.baseUrl): Promise<void> {
  await page.goto(url);
}

/**
 * Adds a product to the shopping cart by its name
 * @param {Page} page - Playwright Page object
 * @param {string} productName - The product identifier/slug (e.g., 'sauce-labs-backpack')
 * @returns {Promise<void>}
 * @example
 * // Add Sauce Labs Backpack to cart
 * await addToCart(page, 'sauce-labs-backpack');
 * 
 * // Add Sauce Labs Bike Light to cart
 * await addToCart(page, 'sauce-labs-bike-light');
 */
export async function addToCart(page: Page, productName: string): Promise<void> {
  await page.click(selectors.addToCart(productName));
}

/**
 * Navigates to the shopping cart page
 * @param {Page} page - Playwright Page object
 * @returns {Promise<void>}
 * @example
 * await goToCart(page);
 */
export async function goToCart(page: Page): Promise<void> {
  await page.click(selectors.cartLink);
}

/**
 * Initiates the checkout process from the cart page
 * @param {Page} page - Playwright Page object
 * @returns {Promise<void>}
 * @throws {Error} If not on cart page or checkout button not found
 * @example
 * // Must be called from cart page
 * await goToCart(page);
 * await startCheckout(page);
 */
export async function startCheckout(page: Page): Promise<void> {
  await page.click(selectors.checkoutButton);
}

/**
 * Fills the shipping information form during checkout
 * @param {Page} page - Playwright Page object
 * @param {string} firstName - Customer's first name
 * @param {string} lastName - Customer's last name
 * @param {string} postalCode - Customer's postal/zip code
 * @returns {Promise<void>}
 * @throws {Error} If not on checkout information page
 * @example
 * await fillShippingInfo(page, 'John', 'Doe', '12345');
 */
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

/**
 * Proceeds to the next step after filling shipping information
 * @param {Page} page - Playwright Page object
 * @returns {Promise<void>}
 * @throws {Error} If not on checkout step one page
 * @example
 * await fillShippingInfo(page, 'John', 'Doe', '12345');
 * await continueCheckout(page);
 */
export async function continueCheckout(page: Page): Promise<void> {
  await page.click(selectors.continueButton);
}

/**
 * Completes the purchase and finalizes the order
 * @param {Page} page - Playwright Page object
 * @returns {Promise<void>}
 * @throws {Error} If not on checkout overview page
 * @example
 * await finishCheckout(page);
 */
export async function finishCheckout(page: Page): Promise<void> {
  await page.click(selectors.finishButton);
}

/**
 * Verifies the number of items in the shopping cart
 * @param {Page} page - Playwright Page object
 * @param {number} count - Expected number of items in the cart
 * @returns {Promise<void>}
 * @throws {AssertionError} If actual count doesn't match expected count
 * @example
 * // Verify cart has exactly 2 items
 * await checkCartHasItems(page, 2);
 * 
 * // Verify cart is empty
 * await checkCartHasItems(page, 0);
 */
export async function checkCartHasItems(page: Page, count: number): Promise<void> {
  const { expect } = await import('@playwright/test');
  await expect(page.locator(selectors.cartItem)).toHaveCount(count);
}

/**
 * Verifies the order confirmation message appears after successful purchase
 * @param {Page} page - Playwright Page object
 * @returns {Promise<void>}
 * @throws {AssertionError} If confirmation message is not found or text doesn't match
 * @example
 * await finishCheckout(page);
 * await checkOrderConfirmation(page);
 */
export async function checkOrderConfirmation(page: Page): Promise<void> {
  const { expect } = await import('@playwright/test');
  await expect(page.locator(selectors.completeHeader)).toHaveText('Thank you for your order!');
}

/**
 * Verifies that the shopping cart badge is not visible (cart is empty)
 * @param {Page} page - Playwright Page object
 * @returns {Promise<void>}
 * @throws {AssertionError} If cart badge is still visible
 * @example
 * // After completing an order, cart should be empty
 * await finishCheckout(page);
 * await checkCartIsEmpty(page);
 * 
 * // Can also be used to verify initial empty state
 * await checkCartIsEmpty(page);
 */
export async function checkCartIsEmpty(page: Page): Promise<void> {
  const { expect } = await import('@playwright/test');
  await expect(page.locator(selectors.cartBadge)).toHaveCount(0);
}

/**
 * Utility function to get current cart item count
 * @param {Page} page - Playwright Page object
 * @returns {Promise<number>} Number of items in the cart
 * @example
 * const itemCount = await getCartItemCount(page);
 * console.log(`Cart has ${itemCount} items`);
 */
export async function getCartItemCount(page: Page): Promise<number> {
  return await page.locator(selectors.cartItem).count();
}

/**
 * Clears all items from the shopping cart
 * @param {Page} page - Playwright Page object
 * @returns {Promise<void>}
 * @example
 * // Remove all items from cart
 * await clearCart(page);
 */
export async function clearCart(page: Page): Promise<void> {
  const removeButtons = await page.locator('[data-test^="remove-"]').all();
  
  for (const button of removeButtons) {
    await button.click();
  }
}

/**
 * Logs out from the application
 * @param {Page} page - Playwright Page object
 * @returns {Promise<void>}
 * @example
 * await logout(page);
 */
export async function logout(page: Page): Promise<void> {
  await page.click('#react-burger-menu-btn');
  await page.click('#logout_sidebar_link');
}