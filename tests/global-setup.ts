import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Set up any global test state here
  console.log('Starting global setup for Password Generator tests...');
  
  // Wait for development server to be ready
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5001', { timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('Development server is ready!');
  } catch (error) {
    console.error('Failed to connect to development server:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;