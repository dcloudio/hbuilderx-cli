const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 通过进程查找 HBuilderX 可执行文件路径
 * @returns {Promise<string|null>} HBuilderX 可执行文件路径，如果找不到返回 null
 */
function findHBuilderXFromProcess() {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const isMac = process.platform === 'darwin';

    let command;
    if (isWindows) {
      // Windows: 查找 HBuilderX.exe 进程
      command = 'wmic process where "name=\'HBuilderX.exe\'" get executablepath /format:csv';
    } else if (isMac) {
      // macOS: 查找 HBuilderX 进程，使用更精确的匹配
      command = 'ps -ax | grep -i "HBuilderX" | grep -v grep';
    } else {
      // Linux: 查找 HBuilderX 进程
      command = 'ps -ax | grep -i "HBuilderX" | grep -v grep';
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(null);
        return;
      }

      try {
        if (isWindows) {
          // Windows 输出解析
          const lines = stdout.split('\n').filter(line => line.trim() && !line.includes('ExecutablePath'));
          for (const line of lines) {
            const parts = line.split(',');
            if (parts.length > 1) {
              const executablePath = parts[parts.length - 1].trim();
              if (executablePath && fs.existsSync(executablePath)) {
                // Windows 使用同目录下的 cli.exe
                const cliPath = path.join(path.dirname(executablePath), 'cli.exe');
                if (fs.existsSync(cliPath)) {
                  resolve(cliPath);
                  return;
                }
              }
            }
          }
        } else {
          // macOS/Linux 输出解析
          const lines = stdout.split('\n');
          for (const line of lines) {
            const match = line.match(/\d+\s+\?\?\s+[\d:.]+\s+(.+)/);
            if (match && match[1]) {
              const executablePath = match[1].trim();
              if (executablePath && fs.existsSync(executablePath)) {
                const cliPath = path.join(path.dirname(executablePath), 'cli');
                if (fs.existsSync(cliPath)) {
                  resolve(cliPath);
                  return;
                }
              }
            }
          }
        }
        resolve(null);
      } catch (parseError) {
        resolve(null);
      }
    });
  });
}

/**
 * 检查 HBuilderX 环境
 * @returns {Promise<{path: string, isRunning: boolean}>} HBuilderX 可执行文件路径和是否已运行
 */
async function checkHBuilderXEnvironment() {
  // 1. 优先通过进程查找已启动的 HBuilderX
  const processPath = await findHBuilderXFromProcess();
  if (processPath) {
    return { path: processPath, isRunning: true };
  }

  // 2. 检查环境变量
  const hbuilderxCliPath = process.env.HBUILDERX_CLI_PATH;
  if (hbuilderxCliPath && fs.existsSync(hbuilderxCliPath)) {
    return { path: hbuilderxCliPath, isRunning: false };
  }

  // 3. 都没有找到，报错
  console.error('未找到 HBuilderX:');
  console.error('1. 未检测到正在运行的 HBuilderX 进程');
  console.error('2. HBUILDERX_CLI_PATH 环境变量未设置或路径无效');
  console.error('');
  console.error('请执行以下操作之一:');
  console.error('- 先启动 HBuilderX 应用程序');
  console.error('- 设置 HBUILDERX_CLI_PATH 环境变量为 HBuilderX CLI 路径');
  if (process.platform === 'darwin' || process.platform === 'linux') {
    console.error('  示例: export HBUILDERX_CLI_PATH="/Applications/HBuilderX.app/Contents/MacOS/cli"');
  } else {
    console.error('  示例: set HBUILDERX_CLI_PATH="C:\\Program Files\\HBuilderX\\cli.exe"');
  }
  process.exit(1);
}

/**
 * 执行 HBuilderX 命令
 * @param {string} hbuilderxCli - HBuilderX CLI 工具路径
 * @param {string[]} args - 命令参数
 * @param {boolean} showOutput - 是否显示输出，默认为 true
 * @returns {Promise<number>} 退出码
 */
function executeCommand(hbuilderxCli, args, showOutput = true) {
  return new Promise((resolve, reject) => {
    const child = spawn(hbuilderxCli, args, {
      stdio: showOutput ? 'inherit' : ['ignore', 'ignore', 'ignore']
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Process killed with signal: ${signal}`));
      } else {
        resolve(code ?? 0);
      }
    });
  });
}

/**
 * 执行 HBuilderX 命令并捕获输出
 * @param {string} hbuilderxCli - HBuilderX CLI 工具路径
 * @param {string[]} args - 命令参数
 * @returns {Promise<{code: number, stdout: string, stderr: string}>} 退出码和输出
 */
function executeCommandWithOutput(hbuilderxCli, args) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const child = spawn(hbuilderxCli, args, {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      // 同时输出到控制台，保持原有体验
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      // 同时输出到控制台，保持原有体验
      process.stderr.write(data);
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Process killed with signal: ${signal}`));
      } else {
        resolve({
          code: code ?? 0,
          stdout,
          stderr
        });
      }
    });
  });
}

/**
 * 获取当前项目路径
 * @returns {string} 项目路径
 */
function getCurrentProjectPath() {
  return process.cwd();
}

/**
 * 处理命令执行错误
 * @param {Error} error - 错误对象
 * @param {string} commandName - 命令名称
 */
function handleCommandError(error, commandName) {
  console.error(`Failed to execute ${commandName} command: ${error.message}`);
  process.exit(1);
}

module.exports = {
  checkHBuilderXEnvironment,
  executeCommand,
  executeCommandWithOutput,
  getCurrentProjectPath,
  handleCommandError
};

