const fs = require('fs');
const path = require('path');
const commandConfigs = require('./command-config');

const initCwd = process.env.INIT_CWD;

if (!initCwd) {
  process.exit(0);
}

const moduleRoot = path.resolve(__dirname, '..');

if (path.resolve(initCwd) === moduleRoot) {
  process.exit(0);
}

const targetPackageJsonPath = path.join(initCwd, 'package.json');

if (!fs.existsSync(targetPackageJsonPath)) {
  process.exit(0);
}

let targetPackage;

try {
  const content = fs.readFileSync(targetPackageJsonPath, 'utf8');
  targetPackage = JSON.parse(content);
} catch (error) {
  console.warn(`HBuilderX-cli: Unable to read or parse ${targetPackageJsonPath}: ${error.message}`);
  process.exit(0);
}

targetPackage.scripts = targetPackage.scripts || {};

let hasChanges = false;

// 遍历配置数组，注册所有脚本
commandConfigs.forEach(config => {
  if (targetPackage.scripts[config.scriptName] !== config.command) {
    targetPackage.scripts[config.scriptName] = config.command;
    hasChanges = true;
  }
});

if (!hasChanges) {
  process.exit(0);
}

try {
  fs.writeFileSync(targetPackageJsonPath, `${JSON.stringify(targetPackage, null, 2)}\n`, 'utf8');
  console.log('HBuilderX-cli: Added uni scripts to package.json');
} catch (error) {
  console.warn(`HBuilderX-cli: Unable to update ${targetPackageJsonPath}: ${error.message}`);
}
