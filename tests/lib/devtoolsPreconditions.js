const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const defaultDevtoolsCliPath = process.env.WECHAT_DEVTOOLS_CLI || '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';

function getPreviewArgs() {
  return [
    'preview',
    '--project',
    root,
    '--qr-format',
    'image',
    '--qr-output',
    '/tmp/pension-abacus-preview.png',
    '--info-output',
    '/tmp/pension-abacus-preview.json',
    '--port',
    '9420',
    '--disable-gpu'
  ];
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function buildPreviewCommand(cliPath = defaultDevtoolsCliPath) {
  return [cliPath, ...getPreviewArgs()].map(shellQuote).join(' ');
}

function hasCommand(command) {
  const pathEntries = (process.env.PATH || '').split(path.delimiter);
  for (const entry of pathEntries) {
    const fullPath = path.join(entry, command);
    try {
      fs.accessSync(fullPath, fs.constants.X_OK);
      return true;
    } catch (error) {
      // Keep scanning PATH.
    }
  }

  return false;
}

function collectDevtoolsPreconditionIssues({ cliPath = defaultDevtoolsCliPath } = {}) {
  const blockers = [];
  const warnings = [];
  const passed = [];

  if (!fs.existsSync(cliPath)) {
    blockers.push(`WeChat DevTools CLI missing: ${cliPath}`);
  } else {
    try {
      execFileSync(cliPath, ['--help'], {
        cwd: root,
        stdio: 'ignore'
      });
      passed.push(`WeChat DevTools CLI exists: ${cliPath}`);
    } catch (error) {
      blockers.push(`WeChat DevTools CLI exists but cannot run --help: ${cliPath}`);
    }
  }

  if (hasCommand('gstack')) {
    passed.push('gstack is available');
  } else {
    warnings.push('gstack is not available in this environment');
  }
  warnings.push('preview and real-device QA must run on a non-sandboxed logged-in desktop');

  return {
    cliPath,
    previewArgs: getPreviewArgs(),
    previewCommand: buildPreviewCommand(cliPath),
    blockers,
    warnings,
    passed
  };
}

module.exports = {
  buildPreviewCommand,
  collectDevtoolsPreconditionIssues,
  defaultDevtoolsCliPath,
  getPreviewArgs,
  root
};
