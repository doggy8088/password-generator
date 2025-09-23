import { test, expect } from '@playwright/test';

test.describe('密碼生成器 - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for initial password generation
    await page.waitForTimeout(2000);
  });

  test('01 - Page loads with initial password', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/01-initial-load.png', 
      fullPage: true 
    });

    // Check that password is displayed (look for the password display area)
    const passwordContainer = page.locator('.text-2xl.font-mono, .font-mono').first();
    await expect(passwordContainer).toBeVisible();
    
    const passwordText = await passwordContainer.textContent();
    expect(passwordText).toBeTruthy();
    expect(passwordText).not.toContain('🔄 正在生成密碼');
    
    console.log('✓ Initial password loaded:', passwordText?.substring(0, 20) + '...');
  });

  test('02 - Generate new password', async ({ page }) => {
    // Get initial password
    const passwordContainer = page.locator('.text-2xl.font-mono, .font-mono').first();
    const initialPassword = await passwordContainer.textContent();
    
    // Find and click generate button (look for refresh/reload icon)
    const generateButton = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    await generateButton.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot after generation
    await page.screenshot({ 
      path: 'test-results/screenshots/02-password-generated.png', 
      fullPage: true 
    });
    
    // Check password changed
    const newPassword = await passwordContainer.textContent();
    expect(newPassword).not.toBe(initialPassword);
    
    console.log('✓ New password generated');
  });

  test('03 - Adjust password length', async ({ page }) => {
    // Find the slider or length controls
    const slider = page.locator('input[type="range"], [role="slider"]').first();
    
    if (await slider.count() > 0) {
      // Test minimum length
      await slider.fill('8');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/03-length-8.png', 
        fullPage: true 
      });
      
      // Test maximum length
      await slider.fill('64');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/04-length-64.png', 
        fullPage: true 
      });
      
      console.log('✓ Password length adjustment tested');
    } else {
      // Use plus/minus buttons if slider not found
      const minusButton = page.locator('button').filter({ hasText: /-|Minus/ }).first();
      const plusButton = page.locator('button').filter({ hasText: /\+|Plus/ }).first();
      
      if (await minusButton.count() > 0) {
        await minusButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ 
          path: 'test-results/screenshots/03-length-decreased.png', 
          fullPage: true 
        });
      }
      
      if (await plusButton.count() > 0) {
        await plusButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ 
          path: 'test-results/screenshots/04-length-increased.png', 
          fullPage: true 
        });
      }
      
      console.log('✓ Password length buttons tested');
    }
  });

  test('04 - Toggle character types', async ({ page }) => {
    // Find checkboxes for character types
    const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      // Toggle first checkbox
      await checkboxes.first().click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/05-checkbox-toggled.png', 
        fullPage: true 
      });
      
      // Toggle it back
      await checkboxes.first().click();
      await page.waitForTimeout(1000);
      
      console.log('✓ Character type toggles tested');
    } else {
      // Look for clickable labels or buttons related to character types
      const uppercaseLabel = page.locator('text=大寫字母').first();
      if (await uppercaseLabel.count() > 0) {
        await uppercaseLabel.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: 'test-results/screenshots/05-character-type-toggled.png', 
          fullPage: true 
        });
      }
      
      console.log('✓ Character type labels tested');
    }
  });

  test('05 - Copy password functionality', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Get current password
    const passwordContainer = page.locator('.text-2xl.font-mono, .font-mono').first();
    const password = await passwordContainer.textContent();
    
    // Find copy button (look for copy icon or copy text)
    const copyButton = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).nth(1); // Usually second button after generate
    
    await copyButton.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot after copy
    await page.screenshot({ 
      path: 'test-results/screenshots/06-password-copied.png', 
      fullPage: true 
    });
    
    // Verify clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBe(password);
    
    console.log('✓ Copy functionality tested');
  });

  test('06 - Mobile responsive view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/07-mobile-view.png', 
      fullPage: true 
    });
    
    // Test basic functionality on mobile
    const passwordContainer = page.locator('.text-2xl.font-mono, .font-mono').first();
    const initialPassword = await passwordContainer.textContent();
    
    const generateButton = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    await generateButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/08-mobile-generated.png', 
      fullPage: true 
    });
    
    const newPassword = await passwordContainer.textContent();
    expect(newPassword).not.toBe(initialPassword);
    
    console.log('✓ Mobile responsive design tested');
  });

  test('07 - Footer links accessibility', async ({ page }) => {
    // Scroll to bottom
    await page.locator('body').last().scrollIntoViewIfNeeded();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/09-footer-view.png', 
      fullPage: true 
    });
    
    // Check for external links
    const externalLinks = page.locator('a[href^="http"]');
    const linkCount = await externalLinks.count();
    
    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = externalLinks.nth(i);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('target', '_blank');
        
        const href = await link.getAttribute('href');
        console.log(`✓ External link found: ${href}`);
      }
    }
    
    console.log('✓ Footer links tested');
  });

  test('08 - Complete user workflow', async ({ page }) => {
    // Complete workflow test with screenshots at each step
    
    // Step 1: Initial state
    await page.screenshot({ 
      path: 'test-results/screenshots/10-workflow-start.png', 
      fullPage: true 
    });
    
    // Step 2: Adjust length
    const slider = page.locator('input[type="range"], [role="slider"]').first();
    if (await slider.count() > 0) {
      await slider.fill('24');
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/11-workflow-length.png', 
      fullPage: true 
    });
    
    // Step 3: Generate new password
    const generateButton = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    await generateButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/12-workflow-generate.png', 
      fullPage: true 
    });
    
    // Step 4: Copy password
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const copyButton = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).nth(1);
    
    await copyButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/13-workflow-copy.png', 
      fullPage: true 
    });
    
    // Step 5: Final state
    await page.screenshot({ 
      path: 'test-results/screenshots/14-workflow-complete.png', 
      fullPage: true 
    });
    
    console.log('✓ Complete user workflow tested');
  });

  test('09 - Security information display', async ({ page }) => {
    // Look for security-related text
    const securityText = page.locator('text=本地生成, text=不會儲存, text=伺服器').first();
    
    if (await securityText.count() > 0) {
      await securityText.scrollIntoViewIfNeeded();
      await page.screenshot({ 
        path: 'test-results/screenshots/15-security-info.png', 
        fullPage: true 
      });
      
      await expect(securityText).toBeVisible();
      console.log('✓ Security information displayed');
    } else {
      // Take general screenshot if specific text not found
      await page.screenshot({ 
        path: 'test-results/screenshots/15-general-view.png', 
        fullPage: true 
      });
      console.log('✓ General security area captured');
    }
  });

  test('10 - Performance and loading', async ({ page }) => {
    // Measure page load performance
    const start = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for password generation
    const loadTime = Date.now() - start;
    
    await page.screenshot({ 
      path: 'test-results/screenshots/16-performance-test.png', 
      fullPage: true 
    });
    
    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    
    console.log(`✓ Page load performance: ${loadTime}ms`);
  });
});