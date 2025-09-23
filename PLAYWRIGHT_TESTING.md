# 密碼生成器 Playwright 測試套件

這個 Playwright 測試套件為密碼生成器網站提供完整的功能測試和視覺驗證，包含詳細的截圖記錄。

## 🚀 功能特色

- ✅ **完整功能覆蓋**: 測試所有主要功能包括密碼生成、長度調整、字元類型選擇等
- 📸 **自動截圖**: 每個測試步驟都會自動截圖保存，便於驗證和錯誤排查
- 🌐 **多瀏覽器支援**: 支援 Chrome、Firefox、Safari (WebKit) 和行動裝置測試
- 📱 **響應式測試**: 測試不同螢幕尺寸下的使用體驗
- ⚡ **CI/CD 整合**: 可在 GitHub Actions 中自動執行
- 🎯 **視覺化驗證**: 提供豐富的視覺化測試結果

## 📋 測試涵蓋範圍

### 主要功能測試
1. **頁面載入與基本UI檢查**
   - 頁面標題驗證
   - 主要元素可見性檢查
   - 初始狀態截圖

2. **密碼生成功能**
   - 密碼生成按鈕功能
   - 多次生成測試
   - 生成結果截圖記錄

3. **密碼長度調整**
   - 滑桿控制測試
   - 不同長度設定 (8-64字元)
   - 極值邊界測試

4. **字元類型選項**
   - 大寫字母開關
   - 小寫字母開關  
   - 數字開關
   - 特殊符號開關

5. **複製到剪貼板**
   - 複製按鈕功能
   - 剪貼板內容驗證
   - 複製成功提示

6. **使用者介面測試**
   - 主題切換功能
   - 響應式設計 (桌面/平板/手機)
   - 頁尾連結驗證

7. **安全性資訊**
   - 安全提示顯示
   - 隱私聲明可見性

### 特殊測試場景
- **效能測試**: 頁面載入速度測量
- **壓力測試**: 快速連續操作測試
- **邊界條件**: 極短/極長密碼測試
- **完整工作流程**: 模擬真實使用者操作

## 🛠️ 安裝與設定

### 安裝依賴
```bash
npm install
npm install --save-dev @playwright/test
npx playwright install
```

### 執行測試
```bash
# 執行所有測試
npm run test

# 執行特定測試檔案
npx playwright test tests/visual-tests.spec.ts

# 以有頭模式執行 (可見瀏覽器)
npm run test:headed

# 執行偵錯模式
npm run test:debug

# 顯示測試報告
npm run test:report
```

## 📸 截圖說明

測試執行時會在 `test-results/screenshots/` 目錄下生成大量截圖，包括：

### 基本功能截圖
- `01-頁面載入.png` - 初始頁面載入狀態
- `02-密碼生成-*.png` - 密碼生成過程記錄
- `03-長度-*.png` - 不同長度設定效果
- `04-選項*-*.png` - 字元類型選項切換
- `05-複製*.png` - 複製功能測試

### 進階功能截圖
- `06-主題切換-*.png` - 主題切換效果
- `07-*版*.png` - 不同裝置尺寸顯示
- `08-*.png` - 頁尾和連結測試
- `09-安全性資訊.png` - 安全提示顯示
- `10-工作流程-*.png` - 完整使用者流程

### 特殊測試截圖
- `11-效能測試-*.png` - 效能測試結果
- `12-*.png` - 邊界條件和壓力測試

## ⚙️ CI/CD 設定

GitHub Actions 工作流程已設定在 `.github/workflows/playwright.yml`：

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test
      - uses: actions/upload-artifact@v4
        with:
          name: test-screenshots
          path: test-results/screenshots/
```

## 📊 測試報告

執行測試後可查看：
- **HTML 報告**: `npx playwright show-report`
- **截圖集合**: `test-results/screenshots/`
- **測試影片**: `test-results/` 中的 `.webm` 檔案
- **追蹤檔案**: 失敗測試的詳細追蹤

## 🔧 自訂設定

### 修改截圖設定
在 `playwright.config.ts` 中調整：
```typescript
use: {
  screenshot: 'only-on-failure', // 'always' | 'only-on-failure' | 'off'
  video: 'retain-on-failure',
}
```

### 新增測試案例
1. 在 `tests/` 目錄下建立新的 `.spec.ts` 檔案
2. 使用現有的測試模式和截圖功能
3. 確保在適當位置呼叫 `page.screenshot()`

## 🚨 常見問題

### 測試失敗排查
1. 檢查 `test-results/` 中的錯誤截圖
2. 查看測試報告中的錯誤訊息
3. 確認開發伺服器正常運作
4. 檢查瀏覽器相容性

### 效能最佳化
- 使用 `--workers=1` 避免並發問題
- 適當調整 `timeout` 設定
- 在 CI 環境中使用無頭模式

## 📝 貢獻指南

歡迎提交新的測試案例或改進現有測試：
1. Fork 此專案
2. 建立功能分支
3. 新增測試並確保通過
4. 提交 Pull Request

## 📄 授權

本測試套件遵循與主專案相同的授權條款。