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
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 30000 });

    // Check if backend is responding
    console.log("⏳ Checking backend health...");
    const response = await page.request.get("http://localhost:5000/api/health");
    if (!response.ok()) {
      throw new Error("Backend is not responding");
    }

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
