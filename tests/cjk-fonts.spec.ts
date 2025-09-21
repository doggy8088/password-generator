import { test, expect } from '@playwright/test';

test.describe('CJK Font Rendering', () => {
  test('should display Chinese characters correctly', async ({ page }) => {
    await page.goto('/');
    
    // Ensure fonts are loaded by waiting for the app to be ready
    await page.waitForSelector('h1', { state: 'visible' });
    
    // Check that Chinese text is present and visible
    const title = page.locator('h1');
    await expect(title).toContainText('隨機密碼產生器');
    
    // Check password length section
    const lengthSection = page.locator('h3').filter({ hasText: '密碼長度' });
    await expect(lengthSection).toBeVisible();
    
    // Check character type labels
    const uppercaseLabel = page.locator('label').filter({ hasText: '大寫字母' });
    await expect(uppercaseLabel).toBeVisible();
    
    const lowercaseLabel = page.locator('label').filter({ hasText: '小寫字母' });
    await expect(lowercaseLabel).toBeVisible();
    
    const numbersLabel = page.locator('label').filter({ hasText: '數字' });
    await expect(numbersLabel).toBeVisible();
    
    const symbolsLabel = page.locator('label').filter({ hasText: '特殊符號' });
    await expect(symbolsLabel).toBeVisible();
    
    // Check security notice
    const securityNotice = page.locator('p').filter({ hasText: '所有密碼均在您的裝置上本地生成' });
    await expect(securityNotice).toBeVisible();
  });

  test('should render CJK characters properly in screenshots', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to be fully loaded
    await page.waitForSelector('h1', { state: 'visible' });
    await page.waitForTimeout(1000); // Allow fonts to load
    
    // Take a screenshot to verify visual rendering
    await expect(page).toHaveScreenshot('cjk-font-rendering.png', {
      fullPage: true,
      threshold: 0.3 // Allow for some font rendering differences across systems
    });
  });

  test('should have proper font family applied', async ({ page }) => {
    await page.goto('/');
    
    // Check computed font family includes CJK fonts
    const bodyElement = page.locator('body');
    const fontFamily = await bodyElement.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    
    // Should include CJK fonts in the font stack
    expect(fontFamily).toMatch(/Noto Sans CJK|Source Han Sans|Microsoft YaHei/i);
  });
});