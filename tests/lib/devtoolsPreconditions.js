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
const defaultPreviewQrOutput = process.env.PENSION_DEVTOOLS_PREVIEW_QR_OUTPUT
  || path.join(root, 'qa/artifacts/devtools/preview.png');
const defaultPreviewInfoOutput = process.env.PENSION_DEVTOOLS_PREVIEW_INFO_OUTPUT
  || path.join(root, 'qa/artifacts/devtools/preview.json');
const defaultLoginQrOutput = process.env.PENSION_DEVTOOLS_LOGIN_QR_OUTPUT
  || path.join(root, 'qa/artifacts/devtools/login.png');
const defaultLoginResultOutput = process.env.PENSION_DEVTOOLS_LOGIN_RESULT_OUTPUT
  || path.join(root, 'qa/artifacts/devtools/login-result.json');

function getPreviewArgs() {
  return [
    'preview',
    '--project',
    root,
    '--qr-format',
    'image',
    '--qr-output',
    defaultPreviewQrOutput,
    '--info-output',
    defaultPreviewInfoOutput,
    '--port',
    '9420',
    '--disable-gpu'
  ];
}

function getLoginArgs() {
  return [
    'login',
    '--qr-format',
    'image',
    '--qr-output',
    defaultLoginQrOutput,
    '--result-output',
    defaultLoginResultOutput,
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

function buildLoginCommand(cliPath = defaultDevtoolsCliPath) {
  return [cliPath, ...getLoginArgs()].map(shellQuote).join(' ');
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

function collectLoginDiagnostics({ cliPath = defaultDevtoolsCliPath, execFile = execFileSync } = {}) {
  try {
    const output = execFile(cliPath, ['islogin', '--port', '9420', '--disable-gpu'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 8000,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const jsonLine = String(output)
      .trim()
      .split(/\r?\n/)
      .find((line) => line.trim().startsWith('{') && line.includes('"login"'));

    if (!jsonLine) {
      return {
        isLoggedIn: null,
        warnings: ['Unable to confirm WeChat DevTools login status from CLI output'],
        blockers: [],
        passed: []
      };
    }

    const status = JSON.parse(jsonLine);
    if (status.login === true) {
      return {
        isLoggedIn: true,
        warnings: [],
        blockers: [],
        passed: ['WeChat DevTools login status is active']
      };
    }

    return {
      isLoggedIn: false,
      warnings: [],
      blockers: ['WeChat DevTools is not logged in; run the login command and scan the QR code before preview/device QA'],
      passed: []
    };
  } catch (error) {
    return {
      isLoggedIn: null,
      warnings: [`Unable to confirm WeChat DevTools login status: ${error.message}`],
      blockers: [],
      passed: []
    };
  }
}

function collectDevtoolsPreconditionIssues({ cliPath = defaultDevtoolsCliPath } = {}) {
  const blockers = [];
  const warnings = [];
  const passed = [];
  const idePortDiagnostics = collectIdePortDiagnostics();
  let loginDiagnostics = {
    isLoggedIn: null,
    blockers: [],
    warnings: [],
    passed: []
  };

  if (!fs.existsSync(cliPath)) {
    blockers.push(`WeChat DevTools CLI missing: ${cliPath}`);
  } else {
    try {
      execFileSync(cliPath, ['--help'], {
        cwd: root,
        stdio: 'ignore'
      });
      passed.push(`WeChat DevTools CLI exists: ${cliPath}`);
      loginDiagnostics = collectLoginDiagnostics({ cliPath });
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
  passed.push(...loginDiagnostics.passed);
  warnings.push(...idePortDiagnostics.warnings);
  warnings.push(...loginDiagnostics.warnings);
  blockers.push(...loginDiagnostics.blockers);
  warnings.push('preview and real-device QA must run on a non-sandboxed logged-in desktop');

  return {
    cliPath,
    idePort: idePortDiagnostics.idePort,
    idePortFile: idePortDiagnostics.idePortFile,
    isLoggedIn: loginDiagnostics.isLoggedIn,
    loginArgs: getLoginArgs(),
    loginCommand: buildLoginCommand(cliPath),
    previewArgs: getPreviewArgs(),
    previewCommand: buildPreviewCommand(cliPath),
    blockers,
    warnings,
    passed
  };
}

module.exports = {
  buildLoginCommand,
  buildPreviewCommand,
  collectLoginDiagnostics,
  collectIdePortDiagnostics,
  collectDevtoolsPreconditionIssues,
  defaultDevtoolsCliPath,
  defaultIdePortFile,
  defaultLoginQrOutput,
  defaultLoginResultOutput,
  defaultPreviewInfoOutput,
  defaultPreviewQrOutput,
  getLoginArgs,
  getPreviewArgs,
  isTcpPortListeningSync,
  readIdePort,
  root
};
