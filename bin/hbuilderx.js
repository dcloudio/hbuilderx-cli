#!/usr/bin/env node

const {
  checkHBuilderXEnvironment,
  executeCommand,
  handleCommandError
} = require('../lib/hbuilderx');

const [...extraArgs] = process.argv.slice(2);

async function main() {
  try {
    const { path: hbuilderxCli, isRunning } = await checkHBuilderXEnvironment();

    // 如果 HBuilderX 未运行，先执行 open
    if (!isRunning) {
      await executeCommand(hbuilderxCli, ['open']);
    }

    await executeCommand(hbuilderxCli, [...extraArgs]);
  } catch (error) {
    handleCommandError(error, 'launch');
  }
}

main();
