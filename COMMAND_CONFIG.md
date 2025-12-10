# HBuilderX-cli 命令配置说明

## 可用命令列表

### uni-launch 开发命令

- `npm run dev:web` - Launch web development server
- `npm run dev:app-android` - Launch Android app development
- `npm run dev:app-ios` - Launch iOS app development
- `npm run dev:app-harmony` - Launch HarmonyOS app development
- `npm run dev:mp-weixin` - Launch WeChat Mini Program development
- `npm run dev:mp-alipay` - Launch Alipay Mini Program development
- `npm run dev:mp-baidu` - Launch Baidu Mini Program development
- `npm run dev:mp-xhs` - Launch Xiaohongshu Mini Program development
- `npm run dev:mp-toutiao` - Launch Toutiao Mini Program development
- `npm run dev:mp-qq` - Launch QQ Mini Program development
- `npm run dev:mp-360` - Launch 360 Mini Program development
- `npm run dev:mp-kuaishou` - Launch Kuaishou Mini Program development
- `npm run dev:mp-lark` - Launch Lark Mini Program development
- `npm run dev:mp-jd` - Launch JD Mini Program development
- `npm run dev:quickapp-huawei` - Launch Huawei QuickApp development
- `npm run dev:quickapp-union` - Launch Union QuickApp development

### uni-logcat 日志查看命令

- `npm run logcat:web` - View web platform logs
- `npm run logcat:app-android` - View Android app logs
- `npm run logcat:app-ios` - View iOS app logs
- `npm run logcat:app-harmony` - View HarmonyOS app logs
- `npm run logcat:mp-weixin` - View WeChat Mini Program logs
- `npm run logcat:mp-alipay` - View Alipay Mini Program logs
- `npm run logcat:mp-baidu` - View Baidu Mini Program logs
- `npm run logcat:mp-xhs` - View Xiaohongshu Mini Program logs
- `npm run logcat:mp-toutiao` - View Toutiao Mini Program logs
- `npm run logcat:mp-qq` - View QQ Mini Program logs
- `npm run logcat:mp-360` - View 360 Mini Program logs
- `npm run logcat:mp-kuaishou` - View Kuaishou Mini Program logs
- `npm run logcat:mp-lark` - View Lark Mini Program logs
- `npm run logcat:mp-jd` - View JD Mini Program logs
- `npm run logcat:quickapp-huawei` - View Huawei QuickApp logs
- `npm run logcat:quickapp-union` - View Union QuickApp logs

### uni-test 测试命令

- `npm run test:web-chrome` - Run web tests with Chrome
- `npm run test:web-firefox` - Run web tests with Firefox
- `npm run test:web-safari` - Run web tests with Safari
- `npm run test:app-android` - Run Android app tests
- `npm run test:app-ios-simulator` - Run iOS simulator app tests
- `npm run test:app-harmony` - Run HarmonyOS app tests
- `npm run test:mp-weixin` - Run WeChat Mini Program tests

## 如何添加新命令

现在添加新命令非常简单，只需要在 `scripts/command-config.js` 文件中添加配置即可。

### 配置格式

```javascript
{
  scriptName: 'npm-script-name',    // package.json 中的脚本名称
  command: 'uni-command args',      // 实际执行的命令
  description: 'Command description' // 命令描述（可选，用于文档）
}
```

### 添加新命令示例

假设你要添加一个新的构建命令 `uni-build`：

1. **创建 bin 文件**：`bin/uni-build.js`
2. **在 package.json 中注册**：
   ```json
   "bin": {
     "uni-build": "./bin/uni-build.js"
   }
   ```
3. **在 command-config.js 中添加配置**：
   ```javascript
   {
     scriptName: 'build:web',
     command: 'uni-build web',
     description: 'Build web project'
   }
   ```

### 完整示例

```javascript
// scripts/command-config.js
module.exports = [
  {
    scriptName: "dev:web",
    command: "uni-launch web",
    description: "Launch web development server",
  },
  {
    scriptName: "logcat:web",
    command: "uni-logcat web",
    description: "View web platform logs",
  },
  {
    scriptName: "test:web",
    command: "uni-test web-chrome",
    description: "Run web tests with Chrome",
  },
  // 新增命令
  {
    scriptName: "build:web",
    command: "uni-build web",
    description: "Build web project",
  },
  {
    scriptName: "dev:app",
    command: "uni-launch app",
    description: "Launch app development",
  },
];
```

### 优势

- ✅ **配置化**：所有命令配置集中管理
- ✅ **易扩展**：添加新命令只需修改配置文件
- ✅ **一致性**：所有命令使用相同的注册逻辑
- ✅ **可维护**：配置和逻辑分离，代码更清晰
- ✅ **文档化**：每个命令都有描述信息

### 注意事项

- 确保 `scriptName` 不与现有脚本冲突
- `command` 必须对应已注册的 bin 命令
- 修改配置后需要重新安装包才能生效
