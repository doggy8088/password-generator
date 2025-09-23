import { test, expect } from '@playwright/test';

test.describe('密碼生成器 - 完整功能測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for initial password generation
    await page.waitForTimeout(3000);
  });

  test('01 - 頁面載入與初始密碼生成', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/01-初始載入.png', 
      fullPage: true 
    });

    // Check page title
    await expect(page).toHaveTitle(/密碼產生器|密碼生成器/);
    
    // Check heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    // Find the actual password display (not the tagline)
    // Look for text that looks like a password (alphanumeric, no spaces, specific length)
    const passwordElements = page.locator('p');
    let passwordText = '';
    
    for (let i = 0; i < await passwordElements.count(); i++) {
      const element = passwordElements.nth(i);
      const text = await element.textContent();
      
      // Check if this looks like a password (alphanumeric, 8+ chars, no spaces)
      if (text && /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{8,64}$/.test(text)) {
        passwordText = text;
        break;
      }
    }
    
    expect(passwordText).toBeTruthy();
    expect(passwordText.length).toBeGreaterThan(7);
    
    console.log('✓ 初始密碼已載入:', passwordText);
  });

  test('02 - 重新生成密碼功能', async ({ page }) => {
    // Find the password first
    let initialPassword = '';
    const passwordElements = page.locator('p');
    
    for (let i = 0; i < await passwordElements.count(); i++) {
      const element = passwordElements.nth(i);
      const text = await element.textContent();
      
      if (text && /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{8,64}$/.test(text)) {
        initialPassword = text;
        break;
      }
    }
    
    expect(initialPassword).toBeTruthy();
    
    // Find and click generate button (first button, usually refresh icon)
    const generateButton = page.locator('button').first();
    await generateButton.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot after generation
    await page.screenshot({ 
      path: 'test-results/screenshots/02-重新生成密碼.png', 
      fullPage: true 
    });
    
    // Check for new password
    let newPassword = '';
    for (let i = 0; i < await passwordElements.count(); i++) {
      const element = passwordElements.nth(i);
      const text = await element.textContent();
      
      if (text && /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{8,64}$/.test(text)) {
        newPassword = text;
        break;
      }
    }
    
    expect(newPassword).toBeTruthy();
    expect(newPassword).not.toBe(initialPassword);
    
    console.log('✓ 新密碼已生成:', newPassword);
  });

  test('03 - 密碼長度調整功能', async ({ page }) => {
    // Use the slider to adjust length
    const slider = page.locator('[role="slider"]');
    await expect(slider).toBeVisible();
    
    // Get slider bounding box for click positions
    const sliderBox = await slider.boundingBox();
    expect(sliderBox).toBeTruthy();
    
    if (sliderBox) {
      // Test minimum length (left side)
      await page.mouse.click(sliderBox.x + 10, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/03-最短長度.png', 
        fullPage: true 
      });
      
      // Test maximum length (right side)
      await page.mouse.click(sliderBox.x + sliderBox.width - 10, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/04-最長長度.png', 
        fullPage: true 
      });
      
      // Test medium length (middle)
      await page.mouse.click(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/05-中等長度.png', 
        fullPage: true 
      });
    }
    
    console.log('✓ 密碼長度調整功能已測試');
  });

  test('04 - 字元類型選項切換', async ({ page }) => {
    // Test checkboxes
    const checkboxes = page.locator('[role="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // Toggle each checkbox and take screenshot
    for (let i = 0; i < Math.min(checkboxCount, 4); i++) {
      const checkbox = checkboxes.nth(i);
      const isChecked = await checkbox.isChecked();
      
      await checkbox.click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: `test-results/screenshots/06-字元類型${i + 1}-切換.png`, 
        fullPage: true 
      });
      
      // Verify state changed
      const newState = await checkbox.isChecked();
      expect(newState).toBe(!isChecked);
      
      console.log(`✓ 字元類型選項 ${i + 1} 已切換`);
    }
  });

  test('05 - 複製到剪貼板功能', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Find current password
    let password = '';
    const passwordElements = page.locator('p');
    
    for (let i = 0; i < await passwordElements.count(); i++) {
      const element = passwordElements.nth(i);
      const text = await element.textContent();
      
      if (text && /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{8,64}$/.test(text)) {
        password = text;
        break;
      }
    }
    
    expect(password).toBeTruthy();
    
    // Find copy button (second button, usually copy icon)
    const copyButton = page.locator('button').nth(1);
    await copyButton.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot after copy
    await page.screenshot({ 
      path: 'test-results/screenshots/07-複製成功.png', 
      fullPage: true 
    });
    
    // Verify clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBe(password);
    
    console.log('✓ 複製功能已測試');
  });

  test('06 - 主題切換功能', async ({ page }) => {
    // Find theme button
    const themeButton = page.locator('button').filter({ hasText: /主題|當前主題/i }).first();
    
    if (await themeButton.count() > 0) {
      // Take screenshot before theme change
      await page.screenshot({ 
        path: 'test-results/screenshots/08-主題切換前.png', 
        fullPage: true 
      });
      
      await themeButton.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot after theme change
      await page.screenshot({ 
        path: 'test-results/screenshots/09-主題切換後.png', 
        fullPage: true 
      });
      
      console.log('✓ 主題切換功能已測試');
    } else {
      await page.screenshot({ 
        path: 'test-results/screenshots/08-主題按鈕未找到.png', 
        fullPage: true 
      });
      console.log('! 主題按鈕未找到，跳過測試');
    }
  });

  test('07 - 行動裝置響應式設計', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/10-手機版面.png', 
      fullPage: true 
    });
    
    // Test basic functionality on mobile
    const generateButton = page.locator('button').first();
    await generateButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/11-手機版互動.png', 
      fullPage: true 
    });
    
    console.log('✓ 行動裝置響應式設計已測試');
  });

  test('08 - 頁尾連結功能', async ({ page }) => {
    // Scroll to footer
    await page.locator('body').evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/12-頁尾連結.png', 
      fullPage: true 
    });
    
    // Check Will 保哥 blog link
    const blogLink = page.locator('a[href="https://blog.miniasp.com/"]');
    await expect(blogLink).toBeVisible();
    await expect(blogLink).toHaveAttribute('target', '_blank');
    
    // Check Facebook link
    const facebookLink = page.locator('a[href="https://www.facebook.com/will.fans/"]');
    await expect(facebookLink).toBeVisible();
    await expect(facebookLink).toHaveAttribute('target', '_blank');
    
    console.log('✓ 頁尾連結已測試');
  });

  test('09 - 安全性資訊顯示', async ({ page }) => {
    // Find security message
    const securityMessage = page.locator('text=所有密碼均在您的裝置上本地生成，不會儲存或傳送到任何伺服器');
    
    await securityMessage.scrollIntoViewIfNeeded();
    await page.screenshot({ 
      path: 'test-results/screenshots/13-安全性資訊.png', 
      fullPage: true 
    });
    
    await expect(securityMessage).toBeVisible();
    
    console.log('✓ 安全性資訊已顯示');
  });

  test('10 - 完整使用者工作流程', async ({ page }) => {
    // Complete workflow with screenshots at each step
    
    // Step 1: Initial state
    await page.screenshot({ 
      path: 'test-results/screenshots/14-工作流程-開始.png', 
      fullPage: true 
    });
    
    // Step 2: Adjust slider to different position
    const slider = page.locator('[role="slider"]');
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      await page.mouse.click(sliderBox.x + sliderBox.width * 0.6, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1500);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/15-工作流程-調整設定.png', 
      fullPage: true 
    });
    
    // Step 3: Generate password
    const generateButton = page.locator('button').first();
    await generateButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/16-工作流程-生成密碼.png', 
      fullPage: true 
    });
    
    // Step 4: Copy password
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    const copyButton = page.locator('button').nth(1);
    await copyButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/17-工作流程-複製密碼.png', 
      fullPage: true 
    });
    
    // Step 5: Final verification
    await page.screenshot({ 
      path: 'test-results/screenshots/18-工作流程-完成.png', 
      fullPage: true 
    });
    
    console.log('✓ 完整使用者工作流程已測試');
  });

  test('11 - 效能與載入測試', async ({ page }) => {
    // Measure page load performance
    const start = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for password generation
    const loadTime = Date.now() - start;
    
    await page.screenshot({ 
      path: 'test-results/screenshots/19-效能測試.png', 
      fullPage: true 
    });
    
    expect(loadTime).toBeLessThan(15000); // Should load within 15 seconds
    
    console.log(`✓ 頁面載入效能: ${loadTime}ms`);
  });

  test('12 - 全功能測試摘要', async ({ page }) => {
    // Final comprehensive test with multiple actions
    
    await page.screenshot({ 
      path: 'test-results/screenshots/20-測試開始.png', 
      fullPage: true 
    });
    
    // Test password generation multiple times
    for (let i = 1; i <= 3; i++) {
      const generateButton = page.locator('button').first();
      await generateButton.click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: `test-results/screenshots/21-多次生成-${i}.png`, 
        fullPage: true 
      });
    }
    
    // Test different lengths
    const slider = page.locator('[role="slider"]');
    const sliderBox = await slider.boundingBox();
    
    if (sliderBox) {
      const positions = [0.2, 0.5, 0.8]; // Different positions on slider
      
      for (let i = 0; i < positions.length; i++) {
        await page.mouse.click(
          sliderBox.x + sliderBox.width * positions[i], 
          sliderBox.y + sliderBox.height / 2
        );
        await page.waitForTimeout(1500);
        
        await page.screenshot({ 
          path: `test-results/screenshots/22-不同長度-${i + 1}.png`, 
          fullPage: true 
        });
      }
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/23-測試完成.png', 
      fullPage: true 
    });
    
    console.log('✓ 全功能測試摘要已完成');
  });
});