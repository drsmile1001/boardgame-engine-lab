# boardgame-engine-lab Agent 指南

## 目的

- 本文件提供自動化 coding agent 在此 monorepo 內快速、安全完成任務。
- 規則以目前 repo 實際設定為準，若設定更新請同步調整本文件。
- 以最小可驗證改動為優先，避免與任務無關的重構。

## 專案結構

- 根目錄是 Bun workspace，`workspaces` 為 `packages/*`。
- 前端在 `packages/frontend`，技術棧為 Vite + SolidJS + Tailwind。
- 後端在 `packages/backend`，技術棧為 Bun + Elysia。
- 共享型別流程為後端輸出 `.types`，前端以 path alias 匯入。

## 工具鏈與品質閘門

- 套件管理與執行器使用 `bun`。
- 主要語言是 TypeScript，整體採 strict 方向。
- 格式化使用 Prettier，並啟用 import sorting plugin。
- 目前沒有 ESLint，請用 `format:check` + `typecheck` 當靜態品質門檻。

## 根目錄命令

- 安裝依賴：`bun install`
- 同時啟動前後端：`bun run dev`
- 只啟動前端：`bun run dev:frontend`
- 只啟動後端：`bun run dev:backend`
- 建置 workspace：`bun run build`
- 套用格式：`bun run format`
- 檢查格式：`bun run format:check`
- 全域型別檢查：`bun run typecheck`

## 前端命令

- 工作目錄：`packages/frontend`
- 開發模式：`bun run dev`
- 建置：`bun run build`
- 預覽：`bun run preview`
- 型別檢查：`bun run typecheck`
- 測試全部：`bun run test`
- 測試監看：`bun run test:watch`

## 後端命令

- 工作目錄：`packages/backend`
- 開發模式：`bun run dev`
- 直接執行入口：`bun run index`
- 型別檢查：`bun run typecheck`
- 產生公開型別：`bun run typegen`
- 後端測試使用 `bunfig.toml`，test root 是 `test`。

## 單一測試執行

### 前端

- 單一檔案：`bun test test/<檔名>.test.ts`
- 依測試名稱過濾：`bun test test -t "<關鍵字>"`
- 單一檔案監看：`bun test --watch test/<檔名>.test.ts`
- 經由 script 傳參：`bun run test -- test/<檔名>.test.ts`

### 後端

- 全部測試：`bun test`
- 單一檔案：`bun test test/<檔名>.test.ts`
- 依測試名稱過濾：`bun test test -t "<關鍵字>"`

## 建議驗證流程

- 只改前端時：`bun run --cwd packages/frontend typecheck && bun run --cwd packages/frontend test`
- 只改後端時：`bun run --cwd packages/backend typecheck && bun test`
- 改到共享型別時：先跑 `bun run --cwd packages/backend typegen` 再跑前端 typecheck。
- 跨前後端改動時：`bun run typecheck && bun run format:check`
- 提交前建議再跑一次：`bun run build`

## 程式風格

### 匯入規範

- 由 `@trivago/prettier-plugin-sort-imports` 自動排序。
- import order 群組：`bun`、`bun:test`、`node:*`、第三方套件、相對路徑。
- 群組間保留空行，specifier 依字母排序。

### 格式化規範

- 使用雙引號。
- 使用分號。
- trailing comma 為 `es5`。
- 不手動微調風格，直接執行 `bun run format`。

### TypeScript 規範

- 優先維持 strict 型別，避免 `any`。
- 偏好明確型別推導與可重用 `type`。
- 跨模組公開介面需有型別輸出。
- type-only import 請使用 `import { type X } from "..."`。
- 前端 alias：`@frontend/*`、`@backend/public`、`@backend/*`。
- 後端 alias：`@backend/*`、`~test/*`。

### 命名規範

- 元件與型別使用 PascalCase。
- 變數與函式使用 camelCase。
- 測試檔使用 `*.test.ts`。
- 常數命名以語意優先，可用全大寫或 camelCase。

### 錯誤處理

- 非預期錯誤需保留可診斷上下文，避免靜默失敗。
- 可恢復流程可用 `try/catch` 或 Promise `catch` 降級。
- 檔案存在性檢查可回傳布林，不必一律丟例外。
- 關機流程需可重入，避免重複 shutdown 導致副作用。
- API 錯誤訊息要可診斷且避免洩漏敏感資料。

### 非同步與 I O

- I/O 與網路呼叫使用 async/await。
- 優先 early return，降低巢狀層級。
- 批次處理檔案前先確認路徑狀態再讀寫。

### SolidJS 慣例

- 事件名稱使用正確大小寫，例如 `onClick`。
- 狀態管理優先 `createSignal` 等原生 primitive。
- 需安全處理 children 時使用 `children(() => props.children)`。
- 條件樣式組合可用 `classList`。

### API 與共享型別

- 後端 API 建議集中在 `buildApi()` 組裝。
- 變更 API 介面後必跑 `typegen`。
- 前端 client 以 `treaty<Api>()` 保持端到端型別一致。
- 對外共享型別請從 `packages/backend/src/public.ts` 匯出。

## 無 lint 指令時的替代策略

- 格式 gate：`bun run format:check`
- 型別 gate：`bun run typecheck`
- 行為 gate：受影響範圍 `bun test`

## Cursor 與 Copilot 規則整合

- 已檢查 `.cursor/rules/`，目前不存在。
- 已檢查 `.cursorrules`，目前不存在。
- 已檢查 `.github/copilot-instructions.md`，目前不存在。
- 若未來新增規則檔，請合併其要求並提高優先級。

## 代理執行守則

- 先讀目標套件 README 與設定檔再動手。
- 只改任務相關檔案，避免順手修其他問題。
- 每次改動後跑受影響區域的 typecheck 或 test。
- 不引入與既有技術棧無關的新工具鏈。
- 未被要求時不調整 CI、版本策略或發版流程。

## 提交前檢查清單

- 受影響程式可編譯且 typecheck 通過。
- 受影響測試至少有一次成功執行。
- 格式檢查通過。
- 若有 API 變更，已同步更新共享型別並驗證前端。
- 變更說明包含動機、範圍與風險。
