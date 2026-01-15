import { test, expect, Page } from '@playwright/test';
import { config } from './test-config';
import {
  connect,
  sortProducts,
  verifyAscendingPrices,
  verifyDescendingPrices,
  takeScreenshot,
} from './page-functions';

let page: Page;

test.describe('Product sorting tests', () => {

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await connect(page);
  });

  test.beforeEach(async () => {
    await page.goto(config.baseUrl + config.pages.inventory);
    const currentSort = await page.locator('.product_sort_container').inputValue();
    expect(currentSort).toBe(config.sort.az);
  });

  test('Sort by price low to high', async () => {
    await sortProducts(page, config.sort.lohi);
    await verifyAscendingPrices(page);
    await takeScreenshot(page, 'price-low-to-high');
  });

  test('Sort by price high to low', async () => {
    await sortProducts(page, config.sort.hilo);
    await verifyDescendingPrices(page);
    await takeScreenshot(page, 'price-high-to-low');
  });

  test.afterAll(async () => {
    await page.close();
  });
});
