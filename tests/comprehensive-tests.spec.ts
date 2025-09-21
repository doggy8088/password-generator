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
    const heading = page.locator('h1', { hasText: /隨機密碼產生器|密碼生成器/ });
    await expect(heading).toBeVisible();
    
    // Wait for password to be generated (not showing loading text)
    await page.waitForFunction(() => {
      const passwordElement = document.querySelector('p');
      return passwordElement && !passwordElement.textContent?.includes('🔄 正在生成密碼');
    }, { timeout: 10000 });
    
    // Check that a password is displayed
    const passwordDisplay = page.locator('p').filter({ hasNotText: '🔄 正在生成密碼' }).first();
    await expect(passwordDisplay).toBeVisible();
    
    const passwordText = await passwordDisplay.textContent();
    expect(passwordText).toBeTruthy();
    expect(passwordText?.length).toBeGreaterThan(0);
    
    console.log('✓ 初始密碼已載入:', passwordText?.substring(0, 20) + '...');
  });

  test('02 - 重新生成密碼功能', async ({ page }) => {
    // Wait for initial password
    await page.waitForFunction(() => {
      const passwordElement = document.querySelector('p');
      return passwordElement && !passwordElement.textContent?.includes('🔄 正在生成密碼');
    });
    
    // Get initial password
    const passwordDisplay = page.locator('p').filter({ hasNotText: '🔄 正在生成密碼' }).first();
    const initialPassword = await passwordDisplay.textContent();
    
    // Find generate button (reload/refresh icon button)
    const generateButton = page.locator('button').filter({ hasNotText: /複製|copy/i }).first();
    
    await generateButton.click();
    await page.waitForTimeout(1500);
    
    // Take screenshot after generation
    await page.screenshot({ 
      path: 'test-results/screenshots/02-重新生成密碼.png', 
      fullPage: true 
    });
    
    // Wait for new password to be generated
    await page.waitForFunction((oldPassword) => {
      const passwordElement = document.querySelector('p');
      return passwordElement && 
             passwordElement.textContent !== oldPassword && 
             !passwordElement.textContent?.includes('🔄 正在生成密碼');
    }, initialPassword);
    
    // Check password changed
    const newPassword = await passwordDisplay.textContent();
    expect(newPassword).not.toBe(initialPassword);
    
    console.log('✓ 新密碼已生成');
  });

  test('03 - 密碼長度調整功能', async ({ page }) => {
    // Use the slider to adjust length
    const slider = page.locator('[role="slider"]');
    await expect(slider).toBeVisible();
    
    // Get slider bounding box for click positions
    const sliderBox = await slider.boundingBox();
    expect(sliderBox).toBeTruthy();
    
    if (sliderBox) {
      // Click at different positions on slider
      // Minimum (left side)
      await page.mouse.click(sliderBox.x + 10, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/03-最短長度.png', 
        fullPage: true 
      });
      
      // Maximum (right side)
      await page.mouse.click(sliderBox.x + sliderBox.width - 10, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/04-最長長度.png', 
        fullPage: true 
      });
      
      // Medium (middle)
      await page.mouse.click(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/05-中等長度.png', 
        fullPage: true 
      });
    }
    
    // Also test plus/minus buttons
    const minusButton = page.locator('button').filter({ hasText: /-/ }).or(page.locator('button svg').filter({ hasText: /minus/i }).locator('..')).first();
    const plusButton = page.locator('button').filter({ hasText: /\+/ }).or(page.locator('button svg').filter({ hasText: /plus/i }).locator('..')).first();
    
    if (await minusButton.count() > 0) {
      await minusButton.click();
      await page.waitForTimeout(500);
    }
    
    if (await plusButton.count() > 0) {
      await plusButton.click();
      await page.waitForTimeout(500);
    }
    
    console.log('✓ 密碼長度調整功能已測試');
  });

  test('04 - 字元類型選項切換', async ({ page }) => {
    // Test each checkbox
    const checkboxes = [
      { selector: '🔤 大寫字母', name: '大寫字母' },
      { selector: '🔡 小寫字母', name: '小寫字母' },
      { selector: '🔢 數字', name: '數字' },
      { selector: '⚡ 特殊符號', name: '特殊符號' }
    ];
    
    for (const [index, checkbox] of checkboxes.entries()) {
      // Find checkbox by associated text
      const checkboxElement = page.locator(`text=${checkbox.selector}`).locator('..').locator('input[type="checkbox"], [role="checkbox"]').first();
      
      if (await checkboxElement.count() > 0) {
        const isChecked = await checkboxElement.isChecked();
        await checkboxElement.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `test-results/screenshots/06-${checkbox.name}-切換.png`, 
          fullPage: true 
        });
        
        // Verify state changed
        const newState = await checkboxElement.isChecked();
        expect(newState).toBe(!isChecked);
        
        console.log(`✓ ${checkbox.name} 選項已切換`);
      }
    }
  });

  test('05 - 複製到剪貼板功能', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Wait for password
    await page.waitForFunction(() => {
      const passwordElement = document.querySelector('p');
      return passwordElement && !passwordElement.textContent?.includes('🔄 正在生成密碼');
    });
    
    // Get current password
    const passwordDisplay = page.locator('p').filter({ hasNotText: '🔄 正在生成密碼' }).first();
    const password = await passwordDisplay.textContent();
    
    // Find copy button (blue button, usually has copy icon)
    const copyButton = page.locator('button').nth(1); // Second button is usually copy
    
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
    const themeButton = page.locator('button').filter({ hasText: /主題|theme/i }).first();
    
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
    const passwordDisplay = page.locator('p').filter({ hasNotText: '🔄 正在生成密碼' }).first();
    const initialPassword = await passwordDisplay.textContent();
    
    const generateButton = page.locator('button').first();
    await generateButton.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/11-手機版互動.png', 
      fullPage: true 
    });
    
    // Verify password changed
    await page.waitForFunction((oldPassword) => {
      const passwordElement = document.querySelector('p');
      return passwordElement && passwordElement.textContent !== oldPassword;
    }, initialPassword);
    
    const newPassword = await passwordDisplay.textContent();
    expect(newPassword).not.toBe(initialPassword);
    
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
    
    // Step 2: Adjust settings
    const slider = page.locator('[role="slider"]');
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      await page.mouse.click(sliderBox.x + sliderBox.width * 0.6, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/15-工作流程-調整設定.png', 
      fullPage: true 
    });
    
    // Step 3: Generate password
    const generateButton = page.locator('button').first();
    await generateButton.click();
    await page.waitForTimeout(1500);
    
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

  test('12 - 密碼強度指示器', async ({ page }) => {
    // Test different password strengths by adjusting length and character types
    
    // Weak password (short, limited types)
    const slider = page.locator('[role="slider"]');
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      // Set to minimum length
      await page.mouse.click(sliderBox.x + 10, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/20-弱密碼強度.png', 
      fullPage: true 
    });
    
    // Strong password (long, all types)
    if (sliderBox) {
      // Set to maximum length
      await page.mouse.click(sliderBox.x + sliderBox.width - 10, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1000);
    }
    
    // Enable all character types
    const symbolsCheckbox = page.locator('text=⚡ 特殊符號').locator('..').locator('[role="checkbox"]').first();
    if (await symbolsCheckbox.count() > 0 && !(await symbolsCheckbox.isChecked())) {
      await symbolsCheckbox.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/21-強密碼強度.png', 
      fullPage: true 
    });
    
    console.log('✓ 密碼強度指示器已測試');
  });
});