import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global test setup...");

  // Create a browser instance for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    console.log("⏳ Waiting for application to be ready...");
    await page.goto("http://localhost:8080");

    // Wait for the page to load by checking for basic elements
    await page.waitForSelector("body", { timeout: 30000 });
    await page.waitForLoadState("networkidle");

    console.log("✅ Application is ready for testing");

    // Optional: Create test data, authenticate test users, etc.
    // await setupTestData();
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
