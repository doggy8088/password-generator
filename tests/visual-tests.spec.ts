import { test, expect } from '@playwright/test';

/**
 * 密碼生成器完整功能測試
 * 這個測試套件涵蓋所有主要功能並在每個步驟截圖保存
 * 適合在 CI 環境中執行，提供完整的視覺化測試記錄
 */
test.describe('密碼生成器 - 完整功能測試與截圖', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // 等待初始密碼生成
    await page.waitForTimeout(3000);
  });

  test('01 - 頁面載入與基本UI檢查', async ({ page }) => {
    // 初始載入截圖
    await page.screenshot({ 
      path: 'test-results/screenshots/01-頁面載入.png', 
      fullPage: true 
    });

    // 檢查頁面標題
    await expect(page).toHaveTitle(/密碼產生器|密碼生成器/);
    
    // 檢查主標題
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    // 檢查是否有密碼顯示區域
    const passwordElements = page.locator('p');
    expect(await passwordElements.count()).toBeGreaterThan(1);
    
    console.log('✓ 頁面基本UI檢查完成');
  });

  test('02 - 密碼生成功能測試', async ({ page }) => {
    // 點擊生成按鈕多次，記錄每次結果
    for (let i = 1; i <= 5; i++) {
      const generateButton = page.locator('button').first();
      await generateButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: `test-results/screenshots/02-密碼生成-${i}.png`, 
        fullPage: true 
      });
    }
    
    console.log('✓ 密碼生成功能測試完成');
  });

  test('03 - 密碼長度調整測試', async ({ page }) => {
    const slider = page.locator('[role="slider"]');
    await expect(slider).toBeVisible();
    
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      // 測試不同長度位置
      const positions = [
        { name: '最短', ratio: 0.05 },
        { name: '短', ratio: 0.25 },
        { name: '中等', ratio: 0.5 },
        { name: '長', ratio: 0.75 },
        { name: '最長', ratio: 0.95 }
      ];
      
      for (const position of positions) {
        await page.mouse.click(
          sliderBox.x + sliderBox.width * position.ratio, 
          sliderBox.y + sliderBox.height / 2
        );
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: `test-results/screenshots/03-長度-${position.name}.png`, 
          fullPage: true 
        });
      }
    }
    
    console.log('✓ 密碼長度調整測試完成');
  });

  test('04 - 字元類型選項測試', async ({ page }) => {
    const checkboxes = page.locator('[role="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    // 對每個checkbox進行操作
    for (let i = 0; i < checkboxCount; i++) {
      const checkbox = checkboxes.nth(i);
      
      // 點擊前截圖
      await page.screenshot({ 
        path: `test-results/screenshots/04-選項${i + 1}-操作前.png`, 
        fullPage: true 
      });
      
      await checkbox.click();
      await page.waitForTimeout(1500);
      
      // 點擊後截圖
      await page.screenshot({ 
        path: `test-results/screenshots/04-選項${i + 1}-操作後.png`, 
        fullPage: true 
      });
    }
    
    console.log('✓ 字元類型選項測試完成');
  });

  test('05 - 複製功能測試', async ({ page }) => {
    // 授予剪貼板權限
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // 複製按鈕測試
    const copyButton = page.locator('button').nth(1);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/05-複製前.png', 
      fullPage: true 
    });
    
    await copyButton.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/05-複製後.png', 
      fullPage: true 
    });
    
    // 再次複製測試
    await copyButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/05-再次複製.png', 
      fullPage: true 
    });
    
    console.log('✓ 複製功能測試完成');
  });

  test('06 - 主題切換測試', async ({ page }) => {
    // 尋找主題按鈕
    const themeButton = page.locator('button').filter({ hasText: /主題|當前主題/i }).first();
    
    if (await themeButton.count() > 0) {
      for (let i = 1; i <= 3; i++) {
        await page.screenshot({ 
          path: `test-results/screenshots/06-主題切換-${i}.png`, 
          fullPage: true 
        });
        
        await themeButton.click();
        await page.waitForTimeout(1000);
      }
      
      console.log('✓ 主題切換測試完成');
    } else {
      await page.screenshot({ 
        path: 'test-results/screenshots/06-主題按鈕未找到.png', 
        fullPage: true 
      });
      console.log('! 主題按鈕未找到');
    }
  });

  test('07 - 響應式設計測試', async ({ page }) => {
    // 測試不同螢幕尺寸
    const viewports = [
      { name: '桌面版', width: 1920, height: 1080 },
      { name: '平板版', width: 768, height: 1024 },
      { name: '手機版', width: 375, height: 667 },
      { name: '小手機', width: 320, height: 568 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `test-results/screenshots/07-${viewport.name}.png`, 
        fullPage: true 
      });
      
      // 在每個尺寸下測試基本功能
      const generateButton = page.locator('button').first();
      await generateButton.click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: `test-results/screenshots/07-${viewport.name}-互動.png`, 
        fullPage: true 
      });
    }
    
    console.log('✓ 響應式設計測試完成');
  });

  test('08 - 頁尾和外部連結測試', async ({ page }) => {
    // 滾動到頁尾
    await page.locator('body').evaluate(el => el.scrollTop = el.scrollHeight);
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/08-頁尾區域.png', 
      fullPage: true 
    });
    
    // 檢查外部連結
    const blogLink = page.locator('a[href="https://blog.miniasp.com/"]');
    const facebookLink = page.locator('a[href="https://www.facebook.com/will.fans/"]');
    
    // 確認連結存在且有正確屬性
    if (await blogLink.count() > 0) {
      await expect(blogLink).toHaveAttribute('target', '_blank');
      await blogLink.hover();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/08-部落格連結懸停.png', 
        fullPage: true 
      });
    }
    
    if (await facebookLink.count() > 0) {
      await expect(facebookLink).toHaveAttribute('target', '_blank');
      await facebookLink.hover();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/08-Facebook連結懸停.png', 
        fullPage: true 
      });
    }
    
    console.log('✓ 頁尾和外部連結測試完成');
  });

  test('09 - 安全性資訊顯示測試', async ({ page }) => {
    // 尋找安全性相關文字
    const securityMessage = page.locator('text=所有密碼均在您的裝置上本地生成，不會儲存或傳送到任何伺服器');
    
    if (await securityMessage.count() > 0) {
      await securityMessage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/09-安全性資訊.png', 
        fullPage: true 
      });
      
      await expect(securityMessage).toBeVisible();
      console.log('✓ 安全性資訊顯示測試完成');
    } else {
      await page.screenshot({ 
        path: 'test-results/screenshots/09-安全性資訊未找到.png', 
        fullPage: true 
      });
      console.log('! 安全性資訊未找到');
    }
  });

  test('10 - 完整使用者工作流程測試', async ({ page }) => {
    // 模擬完整的使用者操作流程
    
    // 步驟1: 初始狀態
    await page.screenshot({ 
      path: 'test-results/screenshots/10-工作流程-01-開始.png', 
      fullPage: true 
    });
    
    // 步驟2: 調整密碼長度
    const slider = page.locator('[role="slider"]');
    const sliderBox = await slider.boundingBox();
    if (sliderBox) {
      await page.mouse.click(sliderBox.x + sliderBox.width * 0.7, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1500);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/10-工作流程-02-調整長度.png', 
      fullPage: true 
    });
    
    // 步驟3: 調整字元類型
    const symbolsCheckbox = page.locator('[role="checkbox"]').last();
    await symbolsCheckbox.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/10-工作流程-03-調整選項.png', 
      fullPage: true 
    });
    
    // 步驟4: 生成新密碼
    const generateButton = page.locator('button').first();
    await generateButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/10-工作流程-04-生成密碼.png', 
      fullPage: true 
    });
    
    // 步驟5: 複製密碼
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    const copyButton = page.locator('button').nth(1);
    await copyButton.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/10-工作流程-05-複製密碼.png', 
      fullPage: true 
    });
    
    // 步驟6: 再次生成確認功能
    await generateButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/10-工作流程-06-再次生成.png', 
      fullPage: true 
    });
    
    console.log('✓ 完整使用者工作流程測試完成');
  });

  test('11 - 效能和載入測試', async ({ page }) => {
    // 效能測試
    const start = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const loadTime = Date.now() - start;
    
    await page.screenshot({ 
      path: `test-results/screenshots/11-效能測試-載入時間${loadTime}ms.png`, 
      fullPage: true 
    });
    
    // 多次快速操作測試
    const generateButton = page.locator('button').first();
    for (let i = 1; i <= 10; i++) {
      await generateButton.click();
      await page.waitForTimeout(300);
      
      if (i % 3 === 0) {
        await page.screenshot({ 
          path: `test-results/screenshots/11-快速操作-${i}.png`, 
          fullPage: true 
        });
      }
    }
    
    expect(loadTime).toBeLessThan(20000); // 20秒內載入
    console.log(`✓ 效能測試完成，載入時間: ${loadTime}ms`);
  });

  test('12 - 壓力測試和邊界條件', async ({ page }) => {
    // 測試極端設定
    const slider = page.locator('[role="slider"]');
    const sliderBox = await slider.boundingBox();
    
    if (sliderBox) {
      // 最短密碼
      await page.mouse.click(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/12-極短密碼.png', 
        fullPage: true 
      });
      
      // 最長密碼
      await page.mouse.click(sliderBox.x + sliderBox.width - 5, sliderBox.y + sliderBox.height / 2);
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/12-極長密碼.png', 
        fullPage: true 
      });
    }
    
    // 嘗試快速連續點擊
    const generateButton = page.locator('button').first();
    for (let i = 0; i < 20; i++) {
      await generateButton.click();
      await page.waitForTimeout(100);
    }
    
    await page.screenshot({ 
      path: 'test-results/screenshots/12-快速連擊後.png', 
      fullPage: true 
    });
    
    console.log('✓ 壓力測試和邊界條件測試完成');
  });
});