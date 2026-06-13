const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const defaultDevtoolsCliPath = process.env.WECHAT_DEVTOOLS_CLI || '/Applications/wechatwebdevtools.app/Contents/MacOS/cli';
const defaultIdePortFile = path.join(
  os.homedir(),
  'Library/Application Support/微信开发者工具/50a7d9210159a32f006158795f893857/Default/.ide'
);

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

function readIdePort({ idePortFile = defaultIdePortFile, readFile = fs.readFileSync } = {}) {
  try {
    const value = String(readFile(idePortFile, 'utf8')).trim();
    if (!/^\d+$/.test(value)) return null;
    return Number(value);
  } catch (error) {
    return null;
  }
}

function isTcpPortListeningSync(port, host = '127.0.0.1', timeoutMs = 300) {
  const probeScript = [
    "const net=require('node:net');",
    `const socket=net.createConnection({host:${JSON.stringify(host)},port:${Number(port)}});`,
    `const timer=setTimeout(()=>{socket.destroy();process.exit(1);},${Number(timeoutMs)});`,
    "socket.on('connect',()=>{clearTimeout(timer);socket.end();process.exit(0);});",
    "socket.on('error',()=>{clearTimeout(timer);process.exit(1);});"
  ].join('');

  try {
    execFileSync(process.execPath, ['-e', probeScript], {
      cwd: root,
      stdio: 'ignore'
    });
    return true;
  } catch (error) {
    return false;
  }
}

function collectIdePortDiagnostics({
  idePortFile = defaultIdePortFile,
  readIdePortFn = readIdePort,
  isPortListening = isTcpPortListeningSync
} = {}) {
  const warnings = [];
  const passed = [];
  const idePort = readIdePortFn({ idePortFile });

  if (!idePort) {
    warnings.push(`WeChat DevTools IDE port file is missing or invalid: ${idePortFile}`);
    return { idePort, idePortFile, warnings, passed };
  }

  if (isPortListening(idePort)) {
    passed.push(`WeChat DevTools IDE service port is listening: ${idePort}`);
  } else {
    warnings.push(`WeChat DevTools IDE port file points to ${idePort}, but no local service is listening; restart DevTools or remove the stale .ide file`);
  }

  return { idePort, idePortFile, warnings, passed };
}

function collectDevtoolsPreconditionIssues({ cliPath = defaultDevtoolsCliPath } = {}) {
  const blockers = [];
  const warnings = [];
  const passed = [];
  const idePortDiagnostics = collectIdePortDiagnostics();

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
  passed.push(...idePortDiagnostics.passed);
  warnings.push(...idePortDiagnostics.warnings);
  warnings.push('preview and real-device QA must run on a non-sandboxed logged-in desktop');

  return {
    cliPath,
    idePort: idePortDiagnostics.idePort,
    idePortFile: idePortDiagnostics.idePortFile,
    previewArgs: getPreviewArgs(),
    previewCommand: buildPreviewCommand(cliPath),
    blockers,
    warnings,
    passed
  };
}

module.exports = {
  buildPreviewCommand,
  collectIdePortDiagnostics,
  collectDevtoolsPreconditionIssues,
  defaultDevtoolsCliPath,
  defaultIdePortFile,
  getPreviewArgs,
  isTcpPortListeningSync,
  readIdePort,
  root
};
