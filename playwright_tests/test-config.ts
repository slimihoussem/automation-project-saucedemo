export const config = {
  baseUrl: 'https://www.saucedemo.com/',

  users: {
    standard: {
      username: 'standard_user',
      password: 'secret_sauce',
    },
  },

  pages: {
    inventory: '/inventory.html',
    cart: '/cart.html',
    checkoutStepOne: '/checkout-step-one.html',
    checkoutStepTwo: '/checkout-step-two.html',
  },

  sort: {
    az: 'az',
    za: 'za',
    lohi: 'lohi',
    hilo: 'hilo',
  },

  paths: {
    screenshots: './playwright_tests/screenshots/',
  },
};

export const selectors = {
  // Login
  username: '#user-name',
  password: '#password',
  loginButton: '#login-button',

  // Products
  sortDropdown: '.product_sort_container',
  inventoryPrice: '.inventory_item_price',
  addToCart: (product: string) => `[data-test="add-to-cart-${product}"]`,

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

  // Confirmation
  completeHeader: '.complete-header',
};
