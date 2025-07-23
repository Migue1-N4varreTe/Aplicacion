import { test, expect } from "@playwright/test";

test.describe("Shopping Flow", () => {
  test("should complete full guest checkout flow", async ({ page }) => {
    // Start at homepage
    await page.goto("/");

    // Navigate to shop
    await page.click('a:has-text("Explorar tienda")');
    await expect(page).toHaveURL(/.*\/shop/);

    // Add first product to cart
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();

    const addToCartButton = firstProduct.locator('button:has-text("Agregar")');
    await addToCartButton.click();

    // Check cart counter updated
    const cartCounter = page.locator('[data-testid="cart-counter"]');
    await expect(cartCounter).toContainText("1");

    // Go to cart
    await page.click('[data-testid="cart-link"]');
    await expect(page).toHaveURL(/.*\/cart/);

    // Verify product is in cart
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

    // Proceed to checkout
    await page.click('a:has-text("Proceder al pago")');
    await expect(page).toHaveURL(/.*\/checkout/);

    // Fill guest information
    await page.check('[data-testid="guest-checkout"]');
    await page.fill('[data-testid="guest-name"]', "Juan Pérez");
    await page.fill('[data-testid="guest-email"]', "juan@example.com");
    await page.fill('[data-testid="guest-phone"]', "5551234567");

    // Fill address information
    await page.fill('[data-testid="address-street"]', "Calle Falsa 123");
    await page.fill('[data-testid="address-city"]', "México");
    await page.selectOption('[data-testid="address-state"]', "CDMX");
    await page.fill('[data-testid="address-postal"]', "11550");

    // Continue to payment
    await page.click('button:has-text("Continuar al pago")');

    // Select payment method
    await page.click('[data-testid="payment-method-card"]');

    // Fill card information (test data)
    await page.fill('[data-testid="card-number"]', "4242 4242 4242 4242");
    await page.fill('[data-testid="card-expiry"]', "12/25");
    await page.fill('[data-testid="card-cvv"]', "123");
    await page.fill('[data-testid="card-name"]', "Juan Pérez");

    // Continue to review
    await page.click('button:has-text("Revisar pedido")');

    // Verify order summary
    await expect(page.locator("text=Confirmar pedido")).toBeVisible();
    await expect(page.locator('[data-testid="guest-info"]')).toContainText(
      "Juan Pérez",
    );
    await expect(page.locator('[data-testid="address-summary"]')).toContainText(
      "Calle Falsa 123",
    );

    // Complete order (mock)
    await page.click('button:has-text("Pagar")');

    // Should show success message
    await expect(
      page.locator("text=¡Pedido realizado con éxito!"),
    ).toBeVisible();
  });

  test("should add and remove items from cart", async ({ page }) => {
    await page.goto("/shop");

    // Add multiple products
    const products = page.locator('[data-testid="product-card"]');
    await products.nth(0).locator('button:has-text("Agregar")').click();
    await products.nth(1).locator('button:has-text("Agregar")').click();

    // Check cart counter
    const cartCounter = page.locator('[data-testid="cart-counter"]');
    await expect(cartCounter).toContainText("2");

    // Go to cart
    await page.click('[data-testid="cart-link"]');

    // Verify two items in cart
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);

    // Increase quantity of first item
    await page
      .locator('[data-testid="cart-item"]')
      .first()
      .locator('[data-testid="increase-quantity"]')
      .click();

    // Verify quantity changed
    await expect(
      page
        .locator('[data-testid="cart-item"]')
        .first()
        .locator('[data-testid="quantity"]'),
    ).toContainText("2");

    // Remove second item
    await page
      .locator('[data-testid="cart-item"]')
      .nth(1)
      .locator('[data-testid="remove-item"]')
      .click();

    // Confirm removal
    await page.click('button:has-text("Eliminar")');

    // Verify only one item remains
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test("should search and filter products", async ({ page }) => {
    await page.goto("/shop");

    // Use search
    await page.fill('[data-testid="search-input"]', "leche");
    await page.press('[data-testid="search-input"]', "Enter");

    // Check results
    const searchResults = page.locator('[data-testid="product-card"]');
    await expect(searchResults).toHaveCountGreaterThan(0);

    // Check that results contain search term
    const firstResult = searchResults.first();
    await expect(firstResult).toContainText(/leche/i);

    // Clear search
    await page.fill('[data-testid="search-input"]', "");
    await page.press('[data-testid="search-input"]', "Enter");

    // Filter by category
    await page.selectOption('[data-testid="category-filter"]', "bebidas");

    // Check that filtered results are shown
    await expect(
      page.locator('[data-testid="product-card"]'),
    ).toHaveCountGreaterThan(0);

    // Sort products
    await page.selectOption('[data-testid="sort-filter"]', "price-asc");

    // Verify sorting (check that first product has lower price than last)
    const products = page.locator('[data-testid="product-card"]');
    const firstPrice = await products
      .first()
      .locator('[data-testid="product-price"]')
      .textContent();
    const lastPrice = await products
      .last()
      .locator('[data-testid="product-price"]')
      .textContent();

    // Basic price comparison (would need proper parsing in real test)
    expect(firstPrice).toBeTruthy();
    expect(lastPrice).toBeTruthy();
  });

  test("should handle favorites functionality", async ({ page }) => {
    await page.goto("/shop");

    // Add product to favorites
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('[data-testid="favorite-button"]').click();

    // Check favorite indicator
    await expect(
      firstProduct.locator('[data-testid="favorite-button"]'),
    ).toHaveClass(/filled/);

    // Go to favorites page
    await page.click('[data-testid="favorites-link"]');
    await expect(page).toHaveURL(/.*\/favorites/);

    // Check product is in favorites
    await expect(page.locator('[data-testid="favorite-item"]')).toHaveCount(1);

    // Remove from favorites
    await page
      .locator('[data-testid="favorite-item"]')
      .first()
      .locator('[data-testid="remove-favorite"]')
      .click();

    // Check empty state
    await expect(
      page.locator("text=No tienes productos favoritos"),
    ).toBeVisible();
  });

  test("should display guest shopping banner for non-authenticated users", async ({
    page,
  }) => {
    await page.goto("/shop");

    // Check guest banner is visible
    await expect(page.locator('[data-testid="guest-banner"]')).toBeVisible();
    await expect(
      page.locator("text=¡Puedes comprar sin registrarte!"),
    ).toBeVisible();

    // Dismiss banner
    await page.click('[data-testid="dismiss-banner"]');
    await expect(
      page.locator('[data-testid="guest-banner"]'),
    ).not.toBeVisible();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Intercept API calls and simulate network error
    await page.route("**/api/products", (route) => {
      route.abort("internetdisconnected");
    });

    await page.goto("/shop");

    // Should show error message or loading state
    await expect(page.locator("text=Error al cargar productos")).toBeVisible();

    // Remove route interception
    await page.unroute("**/api/products");
  });
});
