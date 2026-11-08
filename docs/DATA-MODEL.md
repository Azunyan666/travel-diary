# 数据模型

代码定义见 [`src/types/models.ts`](../src/types/models.ts)。字段一旦发布只增不改。

## 实体

### Trip — 一次旅行

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `crypto.randomUUID()` |
| `title` | string | 如「大理 · 洱海环湖」 |
| `country` / `province` / `city` | string? | 目的地层级，用于点亮地图 |
| `startDate` | string | `YYYY-MM-DD` |
| `endDate` | string? | 单日行程可省略 |
| `coverPhotoId` | string? | 封面照片 |
| `summary` | string? | 一句话总结 |
| `createdAt` / `updatedAt` | number | 毫秒时间戳 |

### Photo — 一张照片与它的那句话

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `crypto.randomUUID()` |
| `tripId` | string | 归属旅行 |
| `thumbnail` | Blob | 约 480px 缩略图，列表只用它 |
| `image` | Blob? | 原图（最长边 2048px JPEG），详情页按需加载 |
| `width` / `height` | number? | 原图尺寸，用于瀑布流占位与比例 |
| `takenAt` | number? | EXIF 时间，缺失时用文件时间；时间线按它分天 |
| `lat` / `lng` | number? | EXIF GPS，可空 |
| `place` | string? | 地点文案 |
| `caption` | string? | 照片下的标注正文 |
| `tags` | string[] | 如「灵感」「趣事」 |
| `createdAt` | number | 导入时间 |

### RegionVisit — 地图点亮（派生，不落库）

由 Trip / Photo 聚合得到：`code`（省份或国家代码）、`kind`、`name`、`count`、`firstVisit`、`lastVisit`。

点亮规则（v1）：一次旅行的 `province` 命中即点亮该省；`count` 为访问次数。后续可被照片 GPS 覆盖到城市级。

## IndexedDB

数据库名 `xingji`，版本号随 schema 递增。

| Store | keyPath | 索引 |
|---|---|---|
| `trips` | `id` | `startDate`、`province` |
| `photos` | `id` | `tripId`、`takenAt` |
| `meta` | `key` | — （`schemaVersion`、设置项） |

- 缩略图与原图分两个字段存储，避免列表加载大图
- `photos.tripId` 上建索引，按旅行查询是最高频路径
- 删除旅行时级联删除照片（软删除策略见 M2）

## Schema 版本与迁移

`meta.schemaVersion` 从 `1` 开始。升级时在 `src/lib/db.ts` 里按版本号顺序执行迁移函数：

```ts
if (oldVersion < 2) {
  // 例：给 photos 增加 tags 字段
}
```

**原则**：只做向前迁移，不做破坏性删除；旧备份必须能被新版本导入。

## 备份格式

`.zip`：

```
manifest.json        // { schemaVersion, exportedAt, app: "xingji", version }
trips.json
photos.json          // 不含 Blob，指向 photos/<id>.jpg
photos/<id>.jpg      // 原图
thumbs/<id>.webp     // 缩略图（可选，导入时可重建）
```

导入时校验 `schemaVersion`，高于当前版本则提示升级应用。
