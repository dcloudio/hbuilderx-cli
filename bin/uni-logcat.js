#!/usr/bin/env node

const {
  checkHBuilderXEnvironment,
  executeCommand,
  getCurrentProjectPath,
  handleCommandError
} = require('../lib/hbuilderx');

const [...extraArgs] = process.argv.slice(2);

async function main() {
  try {
    const { path: hbuilderxCli, isRunning } = await checkHBuilderXEnvironment();
    const currentProjectPath = getCurrentProjectPath();

    const platform = extraArgs[0];
    if (!platform) {
      console.error('Usage: uni-logcat <platform> [options]');
      process.exit(1);
    }

    // 如果 HBuilderX 未运行，先执行 open
    if (!isRunning) {
      await executeCommand(hbuilderxCli, ['open']);
    }

    // 再执行 project open
    await executeCommand(hbuilderxCli, ['project', 'open', '--path', currentProjectPath], false);

    // 最后执行 logcat
    await executeCommand(hbuilderxCli, ['logcat', platform, '--project', currentProjectPath, ...extraArgs.slice(1)]);
  } catch (error) {
    handleCommandError(error, 'logcat');
  }
}

main();
