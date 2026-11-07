# 贡献指南

感谢你愿意帮行迹做得更好。这个项目偏向「小而稳」：功能不多，但每个功能都要在手机上顺手、在弱网下可靠。

## 开始之前

```bash
npm install
npm run dev
npm run typecheck
```

- Node.js >= 20.19（推荐 22 LTS）
- 代码风格：2 空格缩进、单引号、无分号，TypeScript 严格模式
- 设计 token 统一放在 `src/styles/tokens.scss`，不要在组件里写死颜色

## 分支与提交

- 从 `main` 切出功能分支：`feat/photo-import`、`fix/map-tap-area`、`docs/readme`
- 提交信息遵循 Conventional Commits：
  - `feat: 照片导入支持 EXIF 时间`
  - `fix: iOS 上底部安全区重复计算`
  - `docs: 补充数据模型说明`
  - `chore: 升级 vite`
- 一个 PR 只做一件事，附带截图或录屏（移动端改动）

## PR 检查清单

- [ ] `npm run typecheck` 通过
- [ ] `npm run build` 通过
- [ ] 在手机尺寸（375×812）下检查过布局
- [ ] 没有提交 `node_modules`、`dist`、用户照片或备份包
- [ ] 新增用户可见文案时，中英文都考虑过

## 提交 Issue

- Bug：附设备、浏览器版本、复现步骤，最好有截图
- 功能建议：先描述使用场景，再描述功能，避免只说「加个 XX」
