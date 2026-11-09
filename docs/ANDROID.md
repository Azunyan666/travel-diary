# Android 打包说明

行迹的 Android 版本是 Capacitor 套壳：Web 部分与 PWA 完全同一份代码，壳只负责原生安装、图标和启动页。

## 结构

```
android/                    Capacitor 生成的 Android 工程
capacitor.config.ts         appId / appName / webDir
src/                        Web 代码（与 PWA 共用）
```

## 本地构建

需要 JDK 21 + Android SDK（compileSdk 36）。没有 SDK 时，用 GitHub Actions 构建。

```bash
npm install

# Capacitor 构建必须用相对路径，否则 WebView 里资源会 404（白屏）
CAPACITOR=1 npm run build

npx cap sync android   # 把 dist 同步进 Android 工程
cd android
./gradlew assembleDebug   # 或 assembleRelease（需要签名配置）
```

安装到手机：

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 签名

正式版用 `release.keystore` 签名。工程会读取四个环境变量：

| 变量 | 说明 |
|---|---|
| `ANDROID_KEYSTORE_PATH` | keystore 路径，默认 `release.keystore`（相对 `android/app`） |
| `ANDROID_KEYSTORE_PASSWORD` | keystore 密码 |
| `ANDROID_KEY_ALIAS` | 密钥别名 |
| `ANDROID_KEY_PASSWORD` | 密钥密码 |

没有配置时，`assembleRelease` 会回退到 debug 签名：能装能用，但**每次构建签名不同**，覆盖升级会失败（必须先卸载，会丢数据）。所以正式使用前一定配好签名。

## GitHub Actions 自动出包

推 `v*` 标签或手动触发 `Android APK` 工作流：

1. `npm ci` → `npm run build` → `npx cap sync android`
2. 有签名 secrets 时构建 release，否则构建 debug
3. APK 上传为构建产物；如果是 tag，还会附到 GitHub Release

需要的 secrets：

- `ANDROID_KEYSTORE_BASE64`：keystore 的 base64（`base64 -w0 release.jks`）
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## 升级方式

- 同一个签名 + `versionCode` 递增：直接覆盖安装，数据保留
- 换签名：只能卸载重装，**IndexedDB 数据会清空**（先导出 zip 备份）

## 数据存放

Android 版数据存在应用 WebView 的 IndexedDB 里，卸载应用即删除。备份逻辑与 PWA 完全一致（我的 → 数据备份）。
