---
status: done
---

# PlayerRepo 衍生自 EntityStore

## 背景

### 原始需求

將 `packages/backend/src/services/PlayerRepoYaml.ts` 內現有實作，改為以 `@drsmile1001/entity-store` 的 `EntityStoreYaml` 替換，並直接改寫 `PlayerRepo` 介面，使其衍生自 entity-store 抽象，同步處理 backend 註冊。

### 現況

- `PlayerRepoYaml` 目前自行處理 YAML 讀寫、TypeBox 驗證、QuickLRU 快取。
- `EntityStoreYaml` 已提供 YAML 持久化、schema 驗證、記憶體快取、migration 與 lock 機制。
- `PlayerRepo` 介面目前只要求 `list`、`get`、`set`，尚未對齊 `EntityStore` 抽象。
- `packages/backend/src/index.ts` 目前直接 `new PlayerRepoYaml(Logger, "players.yaml")`，沒有顯式初始化流程。
- `@drsmile1001/entity-store` 套件已有標準匯出入口 `@drsmile1001/entity-store`，不需要直接 import `src/EntityStoreYaml.ts`。

## 目標

- 讓 `PlayerRepo` 介面直接對齊 `EntityStore<Player>`。
- 讓 `PlayerRepoYaml` 以 `EntityStoreYaml` 作為正式實作。
- 移除重複的 YAML 解析與驗證邏輯。
- 以標準套件匯入路徑整合 `@drsmile1001/entity-store`。
- 同步更新 backend 註冊方式。
- 直接切換 `players.yaml` 為 `version/data` 格式，不處理舊格式相容。

## 設計決策

- `PlayerRepo` 改為衍生自 `@drsmile1001/entity-store` 的 `EntityStore<Player>`，不再維持自訂最小介面。
- `PlayerRepoYaml` 可直接繼承 `EntityStoreYaml<typeof playerSchema>` 或等價包裝方式，優先減少重複程式。
- 匯入一律使用標準入口 `@drsmile1001/entity-store`。
- 初始化需明確處理 `EntityStoreYaml.init()`；backend service 註冊需一併調整。

## 調整範圍

- `packages/backend/src/services/PlayerRepoYaml.ts`
- `packages/backend/src/services/PlayerRepo.ts`
- `packages/backend/src/index.ts`
- 後端相關測試，若已有對應測試則同步更新；若沒有，新增最小必要測試驗證 YAML 讀寫與初始化行為。

## 限制與考量

- `EntityStoreYaml` 預設輸出格式為 `{ version, data }`，但舊版 `PlayerRepoYaml` 讀寫格式是純陣列；需確認是否接受檔案格式變更。
- `EntityStoreYaml.init()` 在檔案不存在時會建立 migration metadata 格式，即使沒有 migration 也可能改寫檔案內容。
- 現有 `PlayerRepoYaml` 有 `QuickLRU`；改用 `EntityStoreYaml` 後可能不再需要額外快取。
- `PlayerRepo` 一旦改為衍生自 `EntityStore`，所有依賴方型別都會一起收斂到新抽象，需確認沒有只依賴舊介面的特殊實作。

## 待確認事項

- 無

## 實作進度

- [x] 將 backend 的 `PlayerRepo` 介面改為衍生自 `EntityStore<Player>`
- [x] 將 backend 的 `PlayerRepoYaml` 改為使用 `EntityStoreYaml`
- [x] 更新 backend 註冊流程，補上 `init()` 初始化
- [x] 補上 backend 測試並完成 typecheck、test、format 驗證
