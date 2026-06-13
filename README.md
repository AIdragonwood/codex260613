# GitHub Studio

這是一個可以直接部署到 GitHub Pages 的靜態網站範本。

## 檔案

- `index.html`：網站內容與區塊
- `styles.css`：版面、色彩與響應式樣式
- `script.js`：專案篩選與回到頂部互動
- `assets/repo-dashboard.svg`：首頁視覺素材
- `assets/tm-my-image-model/`：Teachable Machine 影像辨識模型

## 部署到 GitHub Pages

1. 建立一個新的 GitHub repository。
2. 把這個資料夾中的所有檔案推到 repository 根目錄。
3. 到 repository 的 `Settings` > `Pages`。
4. Source 選擇 `Deploy from a branch`。
5. Branch 選擇 `main`，資料夾選擇 `/root`。
6. 儲存後等待 GitHub 產生網址。

## 建議修改

- 將 `Silver's GitHub Studio` 改成你的名稱或品牌。
- 把代表專案卡片的標題、描述與 GitHub 連結換成你的 repo。
- 將聯絡區的 GitHub、Email、LinkedIn 換成你的資料。
- 如果重新訓練 Teachable Machine 模型，將新的 `model.json`、`metadata.json`、`weights.bin` 覆蓋到 `assets/tm-my-image-model/`。

## AI 模型注意事項

影像辨識功能使用 Teachable Machine 與 TensorFlow.js CDN。部署後需要網路可以連到 jsDelivr，模型檔則會從本網站的 `assets/tm-my-image-model/` 載入。
