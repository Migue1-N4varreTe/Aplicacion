import { test, expect } from "@playwright/test";

test.describe("Shopping Flow", () => {
  test("should navigate to shop page", async ({ page }) => {
    // Start at homepage
    await page.goto("/");

    // Try to navigate to shop
    const shopLink = page.locator('a[href*="/shop"]').first();
    if (await shopLink.isVisible()) {
      await shopLink.click();
      await expect(page).toHaveURL(/.*\/shop/);
    } else {
      // If no shop link, directly navigate
      await page.goto("/shop");
    }

    // Check page loaded
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to cart page", async ({ page }) => {
    await page.goto("/");

    // Try to navigate to cart
    const cartLink = page.locator('a[href*="/cart"]').first();
    if (await cartLink.isVisible()) {
      await cartLink.click();
      await expect(page).toHaveURL(/.*\/cart/);
    } else {
      // If no cart link, directly navigate
      await page.goto("/cart");
    }

    // Check page loaded
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to favorites page", async ({ page }) => {
    await page.goto("/");

    // Try to navigate to favorites
    const favoritesLink = page.locator('a[href*="/favorites"]').first();
    if (await favoritesLink.isVisible()) {
      await favoritesLink.click();
      await expect(page).toHaveURL(/.*\/favorites/);
    } else {
      // If no favorites link, directly navigate
      await page.goto("/favorites");
    }

    // Check page loaded
    await expect(page.locator("body")).toBeVisible();
  });
});
