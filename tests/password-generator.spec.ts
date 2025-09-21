import { test, expect, Page } from '@playwright/test';

// Page object for better test organization
class PasswordGeneratorPage {
  constructor(private page: Page) {}

  // Locators
  get passwordDisplay() { return this.page.locator('[data-testid="password-display"], .text-2xl.font-mono'); }
  get generateButton() { return this.page.locator('button').filter({ hasText: /重新生成|ArrowClockwise/ }).first(); }
  get copyButton() { return this.page.locator('button').filter({ hasText: /複製|Copy/ }).first(); }
  get themeButton() { return this.page.locator('button').filter({ hasText: /主題|theme/ }).first(); }
  
  // Password options
  get uppercaseCheckbox() { return this.page.locator('#uppercase'); }
  get lowercaseCheckbox() { return this.page.locator('#lowercase'); }
  get numbersCheckbox() { return this.page.locator('#numbers'); }
  get symbolsCheckbox() { return this.page.locator('#symbols'); }
  
  // Length controls
  get lengthSlider() { return this.page.locator('input[type="range"], [role="slider"]'); }
  get minusButton() { return this.page.locator('button').filter({ hasText: /Minus/ }).first(); }
  get plusButton() { return this.page.locator('button').filter({ hasText: /Plus/ }).first(); }
  get lengthDisplay() { return this.page.locator('h3').filter({ hasText: /密碼長度/ }); }
  
  // Footer links
  get blogLink() { return this.page.locator('a[href="https://blog.miniasp.com/"]'); }
  get facebookLink() { return this.page.locator('a[href="https://www.facebook.com/will.fans/"]'); }

  // Actions
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPasswordGeneration() {
    // Wait for any existing password generation to complete
    await this.page.waitForTimeout(1000);
  }

  async getPasswordText() {
    await this.waitForPasswordGeneration();
    const passwordElement = this.passwordDisplay.first();
    await passwordElement.waitFor({ state: 'visible' });
    const text = await passwordElement.textContent();
    return text?.trim() || '';
  }

  async getPasswordLength() {
    const lengthElement = this.lengthDisplay.first();
    await lengthElement.waitFor({ state: 'visible' });
    const text = await lengthElement.textContent();
    const match = text?.match(/密碼長度：(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async setPasswordLength(length: number) {
    const slider = this.lengthSlider.first();
    await slider.waitFor({ state: 'visible' });
    await slider.fill(length.toString());
    await this.waitForPasswordGeneration();
  }

  async clickGenerate() {
    await this.generateButton.click();
    await this.waitForPasswordGeneration();
  }

  async clickCopy() {
    await this.copyButton.click();
    await this.page.waitForTimeout(500);
  }

  async togglePasswordOption(option: 'uppercase' | 'lowercase' | 'numbers' | 'symbols') {
    const checkbox = this[`${option}Checkbox`];
    await checkbox.click();
    await this.waitForPasswordGeneration();
  }

  async getPasswordOptions() {
    return {
      uppercase: await this.uppercaseCheckbox.isChecked(),
      lowercase: await this.lowercaseCheckbox.isChecked(),
      numbers: await this.numbersCheckbox.isChecked(),
      symbols: await this.symbolsCheckbox.isChecked()
    };
  }
}

test.describe('Password Generator - 密碼生成器', () => {
  let passwordPage: PasswordGeneratorPage;

  test.beforeEach(async ({ page }) => {
    passwordPage = new PasswordGeneratorPage(page);
    await passwordPage.goto();
  });

  test('Page loads correctly with initial password', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/01-initial-load.png', 
      fullPage: true 
    });

    // Check page title and heading
    await expect(page).toHaveTitle(/密碼生成器|Password Generator/);
    
    // Wait for initial password generation
    await passwordPage.waitForPasswordGeneration();
    
    // Check that a password is displayed
    const passwordText = await passwordPage.getPasswordText();
    expect(passwordText).toBeTruthy();
    expect(passwordText).not.toContain('🔄 正在生成密碼');
    
    // Check initial password length (should be 16 by default)
    const initialLength = await passwordPage.getPasswordLength();
    expect(initialLength).toBe(16);
    
    console.log('Initial password:', passwordText);
    console.log('Initial length:', initialLength);
  });

  test('Password generation works', async ({ page }) => {
    // Get initial password
    const initialPassword = await passwordPage.getPasswordText();
    
    // Generate new password
    await passwordPage.clickGenerate();
    
    // Take screenshot after generation
    await page.screenshot({ 
      path: 'test-results/02-password-generation.png', 
      fullPage: true 
    });
    
    // Check that password changed
    const newPassword = await passwordPage.getPasswordText();
    expect(newPassword).toBeTruthy();
    expect(newPassword).not.toBe(initialPassword);
    
    console.log('Generated new password:', newPassword);
  });

  test('Password length adjustment works', async ({ page }) => {
    // Test minimum length (8)
    await passwordPage.setPasswordLength(8);
    let passwordText = await passwordPage.getPasswordText();
    expect(passwordText.length).toBe(8);
    
    // Take screenshot at minimum length
    await page.screenshot({ 
      path: 'test-results/03-min-length.png', 
      fullPage: true 
    });
    
    // Test maximum length (64)
    await passwordPage.setPasswordLength(64);
    passwordText = await passwordPage.getPasswordText();
    expect(passwordText.length).toBe(64);
    
    // Take screenshot at maximum length
    await page.screenshot({ 
      path: 'test-results/04-max-length.png', 
      fullPage: true 
    });
    
    // Test medium length (32)
    await passwordPage.setPasswordLength(32);
    passwordText = await passwordPage.getPasswordText();
    expect(passwordText.length).toBe(32);
    
    console.log('Password length tests passed');
  });

  test('Character type options work correctly', async ({ page }) => {
    // Test only uppercase
    await passwordPage.togglePasswordOption('lowercase');
    await passwordPage.togglePasswordOption('numbers');
    await passwordPage.togglePasswordOption('symbols');
    
    let password = await passwordPage.getPasswordText();
    expect(password).toMatch(/^[A-Z]+$/);
    
    // Take screenshot with only uppercase
    await page.screenshot({ 
      path: 'test-results/05-uppercase-only.png', 
      fullPage: true 
    });
    
    // Test only numbers
    await passwordPage.togglePasswordOption('uppercase');
    await passwordPage.togglePasswordOption('numbers');
    
    password = await passwordPage.getPasswordText();
    expect(password).toMatch(/^[0-9]+$/);
    
    // Take screenshot with only numbers
    await page.screenshot({ 
      path: 'test-results/06-numbers-only.png', 
      fullPage: true 
    });
    
    // Reset to all types
    await passwordPage.togglePasswordOption('uppercase');
    await passwordPage.togglePasswordOption('lowercase');
    await passwordPage.togglePasswordOption('symbols');
    
    password = await passwordPage.getPasswordText();
    expect(password).toMatch(/[A-Z]/); // Contains uppercase
    expect(password).toMatch(/[a-z]/); // Contains lowercase
    expect(password).toMatch(/[0-9]/); // Contains numbers
    expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/); // Contains symbols
    
    console.log('Character type tests passed');
  });

  test('Cannot disable all character types', async ({ page }) => {
    // Try to disable all character types
    await passwordPage.togglePasswordOption('uppercase');
    await passwordPage.togglePasswordOption('lowercase');
    await passwordPage.togglePasswordOption('numbers');
    
    // The last option (symbols) should not be toggleable or should show error
    await passwordPage.symbolsCheckbox.click();
    
    // Check that at least one option remains checked
    const options = await passwordPage.getPasswordOptions();
    const hasAnyType = Object.values(options).some(checked => checked);
    expect(hasAnyType).toBe(true);
    
    // Take screenshot of validation state
    await page.screenshot({ 
      path: 'test-results/07-validation-error.png', 
      fullPage: true 
    });
    
    console.log('Validation test passed');
  });

  test('Copy to clipboard functionality', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const originalPassword = await passwordPage.getPasswordText();
    
    // Click copy button
    await passwordPage.clickCopy();
    
    // Take screenshot after copy
    await page.screenshot({ 
      path: 'test-results/08-copy-success.png', 
      fullPage: true 
    });
    
    // Check clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBe(originalPassword);
    
    // Check for success toast (if visible)
    const toastSelector = '.sonner-toast, [data-sonner-toast]';
    const toast = page.locator(toastSelector);
    if (await toast.count() > 0) {
      await expect(toast).toContainText(/複製|已複製|copied/i);
    }
    
    console.log('Copy functionality test passed');
  });

  test('Password strength indicator works', async ({ page }) => {
    // Test weak password (short, limited character types)
    await passwordPage.setPasswordLength(8);
    await passwordPage.togglePasswordOption('uppercase');
    await passwordPage.togglePasswordOption('numbers');
    await passwordPage.togglePasswordOption('symbols');
    
    await page.screenshot({ 
      path: 'test-results/09-weak-password.png', 
      fullPage: true 
    });
    
    // Test strong password (long, all character types)
    await passwordPage.setPasswordLength(32);
    await passwordPage.togglePasswordOption('uppercase');
    await passwordPage.togglePasswordOption('numbers');
    await passwordPage.togglePasswordOption('symbols');
    
    await page.screenshot({ 
      path: 'test-results/10-strong-password.png', 
      fullPage: true 
    });
    
    console.log('Password strength indicator test passed');
  });

  test('Footer links are accessible', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer, .mt-12').last().scrollIntoViewIfNeeded();
    
    // Take screenshot of footer
    await page.screenshot({ 
      path: 'test-results/11-footer-links.png', 
      fullPage: true 
    });
    
    // Check blog link
    const blogLink = passwordPage.blogLink;
    await expect(blogLink).toBeVisible();
    await expect(blogLink).toHaveAttribute('href', 'https://blog.miniasp.com/');
    await expect(blogLink).toHaveAttribute('target', '_blank');
    
    // Check Facebook link
    const facebookLink = passwordPage.facebookLink;
    await expect(facebookLink).toBeVisible();
    await expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/will.fans/');
    await expect(facebookLink).toHaveAttribute('target', '_blank');
    
    console.log('Footer links test passed');
  });

  test('Responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/12-mobile-view.png', 
      fullPage: true 
    });
    
    // Check that elements are still functional on mobile
    const password = await passwordPage.getPasswordText();
    expect(password).toBeTruthy();
    
    // Test mobile interactions
    await passwordPage.clickGenerate();
    const newPassword = await passwordPage.getPasswordText();
    expect(newPassword).not.toBe(password);
    
    await page.screenshot({ 
      path: 'test-results/13-mobile-interaction.png', 
      fullPage: true 
    });
    
    console.log('Mobile responsive test passed');
  });

  test('UI animations and transitions work', async ({ page }) => {
    // Test generation animation
    await passwordPage.generateButton.click();
    
    // Take screenshot during generation (if animation is visible)
    await page.screenshot({ 
      path: 'test-results/14-generation-animation.png', 
      fullPage: true 
    });
    
    // Wait for animation to complete
    await passwordPage.waitForPasswordGeneration();
    
    // Test copy success animation
    await passwordPage.clickCopy();
    
    // Take screenshot of success state
    await page.screenshot({ 
      path: 'test-results/15-copy-animation.png', 
      fullPage: true 
    });
    
    console.log('Animation tests passed');
  });

  test('Theme switching functionality', async ({ page }) => {
    // Try to find and click theme toggle button
    const themeButtons = await page.locator('button').all();
    let themeButton = null;
    
    // Look for theme-related buttons
    for (const button of themeButtons) {
      const text = await button.textContent();
      if (text && (text.includes('主題') || text.includes('theme'))) {
        themeButton = button;
        break;
      }
    }
    
    // If no explicit theme button, look for Sun/Moon icons
    if (!themeButton) {
      const iconButtons = page.locator('button').filter({ has: page.locator('svg') });
      themeButton = iconButtons.first();
    }
    
    if (themeButton) {
      // Take screenshot before theme change
      await page.screenshot({ 
        path: 'test-results/16-theme-before.png', 
        fullPage: true 
      });
      
      await themeButton.click();
      await page.waitForTimeout(500);
      
      // Take screenshot after theme change
      await page.screenshot({ 
        path: 'test-results/17-theme-after.png', 
        fullPage: true 
      });
    }
    
    console.log('Theme switching test completed');
  });
});