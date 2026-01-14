// Simple config for selectors
export const selectors = {
  // Login
  username: '#user-name',
  password: '#password',
  loginButton: '#login-button',
  
  // Products
  addToCart: (productName: string) => `[data-test="add-to-cart-${productName}"]`,
  
  // Cart
  cartLink: '.shopping_cart_link',
  cartItem: '.cart_item',
  cartBadge: '.shopping_cart_badge',
  
  // Checkout
  checkoutButton: '[data-test="checkout"]',
  firstName: '[data-test="firstName"]',
  lastName: '[data-test="lastName"]',
  postalCode: '[data-test="postalCode"]',
  continueButton: '[data-test="continue"]',
  finishButton: '[data-test="finish"]',
  
  // Others
  inventoryItemName: '.inventory_item_name',
  summaryInfo: '.summary_info',
  completeHeader: '.complete-header',
};

// Test data
export const testData = {
  baseUrl: '/',
  standardUser: {
    username: 'standard_user',
    password: 'secret_sauce',
  }
};