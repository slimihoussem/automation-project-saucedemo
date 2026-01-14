import { test, expect } from '@playwright/test';
import * as pageFunctions from './page-functions';

// Simple performance tracking
const performanceStats: Array<{
  test: string;
  duration: number;
  status: 'PASS' | 'FAIL';
  timestamp: string;
}> = [];

test.describe('Checkout Process with Stats', () => {
  test.beforeEach(async ({ page }) => {
    console.time('setup');
    await pageFunctions.goto(page);
    await pageFunctions.login(page);
    await expect(page).toHaveURL(/inventory.html/);
    console.timeEnd('setup');
  });

  test('Complete checkout with one item', async ({ page }) => {
    const testStart = Date.now();
    
    try {
      console.time('add-to-cart');
      await pageFunctions.addToCart(page, 'sauce-labs-backpack');
      console.timeEnd('add-to-cart');
      
      console.time('go-to-cart');
      await pageFunctions.goToCart(page);
      console.timeEnd('go-to-cart');
      
      await pageFunctions.checkCartHasItems(page, 1);
      
      console.time('checkout-process');
      await pageFunctions.startCheckout(page);
      await pageFunctions.fillShippingInfo(page, 'Test', 'User', '12345');
      await pageFunctions.continueCheckout(page);
      console.timeEnd('checkout-process');
      
      await expect(page).toHaveURL(/checkout-step-two.html/);
      
      console.time('complete-purchase');
      await pageFunctions.finishCheckout(page);
      console.timeEnd('complete-purchase');
      
      await pageFunctions.checkOrderConfirmation(page);
      await pageFunctions.checkCartIsEmpty(page);
      
      const testDuration = Date.now() - testStart;
      performanceStats.push({
        test: 'Complete checkout with one item',
        duration: testDuration,
        status: 'PASS',
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Test completed in ${testDuration}ms`);
      
    } catch (error) {
      const testDuration = Date.now() - testStart;
      performanceStats.push({
        test: 'Complete checkout with one item',
        duration: testDuration,
        status: 'FAIL',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  });
  
  test('Checkout with multiple items', async ({ page }) => {
    const testStart = Date.now();
    
    try {
      await pageFunctions.addToCart(page, 'sauce-labs-backpack');
      await pageFunctions.addToCart(page, 'sauce-labs-bike-light');
      
      await pageFunctions.goToCart(page);
      await pageFunctions.checkCartHasItems(page, 2);
      
      await pageFunctions.startCheckout(page);
      await pageFunctions.fillShippingInfo(page, 'Test', 'User', '12345');
      await pageFunctions.continueCheckout(page);
      await pageFunctions.finishCheckout(page);
      await pageFunctions.checkOrderConfirmation(page);
      
      const testDuration = Date.now() - testStart;
      performanceStats.push({
        test: 'Checkout with multiple items',
        duration: testDuration,
        status: 'PASS',
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Test completed in ${testDuration}ms`);
      
    } catch (error) {
      const testDuration = Date.now() - testStart;
      performanceStats.push({
        test: 'Checkout with multiple items',
        duration: testDuration,
        status: 'FAIL',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  });
  
  test.afterAll(() => {
    // Print summary statistics
    console.log('\n📊 Test Statistics Summary:');
    console.log('==========================');
    
    const totalTests = performanceStats.length;
    const passedTests = performanceStats.filter(s => s.status === 'PASS').length;
    const failedTests = performanceStats.filter(s => s.status === 'FAIL').length;
    const totalDuration = performanceStats.reduce((sum, stat) => sum + stat.duration, 0);
    const avgDuration = totalDuration / totalTests;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Execution Time: ${totalDuration}ms`);
    console.log(`Average Test Duration: ${avgDuration.toFixed(0)}ms`);
    
    console.log('\nIndividual Test Results:');
    performanceStats.forEach(stat => {
      console.log(`${stat.status === 'PASS' ? '✅' : '❌'} ${stat.test}: ${stat.duration}ms`);
    });
  });
});