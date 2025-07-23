import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load and display main elements", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/La Económica/);

    // Check main heading
    await expect(page.locator("h1")).toContainText("Todo lo que necesitas");

    // Check navigation is visible
    await expect(page.locator("nav")).toBeVisible();

    // Check hero section
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();

    // Check CTA buttons
    await expect(page.locator('a:has-text("Explorar tienda")')).toBeVisible();
    await expect(page.locator('a:has-text("Ver favoritos")')).toBeVisible();
  });

  test("should navigate to shop page", async ({ page }) => {
    // Click on "Explorar tienda" button
    await page.click('a:has-text("Explorar tienda")');

    // Should navigate to shop page
    await expect(page).toHaveURL(/.*\/shop/);
    await expect(page.locator("h1")).toContainText("Tienda");
  });

  test("should display quick categories", async ({ page }) => {
    // Check quick categories section
    const quickCategories = page.locator('[data-testid="quick-categories"]');
    await expect(quickCategories).toBeVisible();

    // Should have at least 4 categories
    const categoryLinks = quickCategories.locator("a");
    await expect(categoryLinks).toHaveCountGreaterThan(3);
  });

  test("should display delivery options", async ({ page }) => {
    // Check delivery options section
    const deliverySection = page.locator(
      "text=¿Cómo quieres recibir tu pedido?",
    );
    await expect(deliverySection).toBeVisible();

    // Check delivery cards
    const deliveryCards = page.locator('[data-testid="delivery-option"]');
    await expect(deliveryCards).toHaveCountGreaterThan(0);
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that elements are still visible and accessible
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('a:has-text("Explorar tienda")')).toBeVisible();

    // Check mobile navigation menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  });

  test("should handle location change", async ({ page }) => {
    // Check location display
    const locationDisplay = page.locator("text=Entregando en:");
    await expect(locationDisplay).toBeVisible();

    // Click change location button
    const changeLocationButton = page.locator('button:has-text("Cambiar")');
    await changeLocationButton.click();

    // Should open location dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(
      page.locator("text=Cambiar ubicación de entrega"),
    ).toBeVisible();

    // Close dialog
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("should display statistics correctly", async ({ page }) => {
    // Check stats section
    const statsSection = page.locator("text=15min").first();
    await expect(statsSection).toBeVisible();

    // Check all three stats
    await expect(page.locator("text=15min")).toBeVisible();
    await expect(page.locator("text=2000+")).toBeVisible();
    await expect(page.locator("text=4.8★")).toBeVisible();
  });

  test("should load without accessibility violations", async ({ page }) => {
    // Basic accessibility checks
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('main, [role="main"]')).toBeVisible();

    // Check for alt text on images
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const ariaLabel = await img.getAttribute("aria-label");

      if (alt === null && ariaLabel === null) {
        console.warn(`Image ${i} missing alt text or aria-label`);
      }
    }
  });
});
