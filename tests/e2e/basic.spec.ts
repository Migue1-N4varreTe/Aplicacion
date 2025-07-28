import { test, expect } from "@playwright/test";

test.describe("Basic E2E Tests", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to shop", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to cart", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.locator("body")).toBeVisible();
  });
});
