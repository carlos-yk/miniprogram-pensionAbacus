const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  collectIdePortDiagnostics,
  collectLoginDiagnostics,
  readIdePort
} = require('./lib/devtoolsPreconditions');

const root = path.resolve(__dirname, '..');

function createFakeCli() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-devtools-cli-'));
  const cliPath = path.join(dir, 'cli');
  fs.writeFileSync(cliPath, '#!/bin/sh\nif [ "$1" = "--help" ]; then exit 0; fi\necho "$@"\nexit 0\n');
  fs.chmodSync(cliPath, 0o755);
  return cliPath;
}

function createFailingPreviewCli() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-devtools-cli-'));
  const cliPath = path.join(dir, 'cli');
  fs.writeFileSync(cliPath, '#!/bin/sh\nif [ "$1" = "--help" ]; then exit 0; fi\necho "preview failed" >&2\nexit 1\n');
  fs.chmodSync(cliPath, 0o755);
  return cliPath;
}

function createLoginCli() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-devtools-cli-'));
  const cliPath = path.join(dir, 'cli');
  fs.writeFileSync(cliPath, [
    '#!/bin/sh',
    'if [ "$1" = "--help" ]; then exit 0; fi',
    'output=""',
    'result=""',
    'while [ "$#" -gt 0 ]; do',
    '  case "$1" in',
    '    --qr-output) output="$2"; shift 2 ;;',
    '    --result-output) result="$2"; shift 2 ;;',
    '    *) shift ;;',
    '  esac',
    'done',
    'mkdir -p "$(dirname "$output")"',
    'printf "fake login qr" > "$output"',
    'printf "{\\"login\\":true}" > "$result"',
    'exit 0'
  ].join('\n'));
  fs.chmodSync(cliPath, 0o755);
  return cliPath;
}

function createPreviewOutputEnv() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-devtools-preview-'));
  return {
    PENSION_DEVTOOLS_PREVIEW_QR_OUTPUT: path.join(dir, 'preview.png'),
    PENSION_DEVTOOLS_PREVIEW_INFO_OUTPUT: path.join(dir, 'preview.json')
  };
}

function createLoginOutputEnv() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-devtools-login-'));
  return {
    PENSION_DEVTOOLS_LOGIN_QR_OUTPUT: path.join(dir, 'login.png'),
    PENSION_DEVTOOLS_LOGIN_RESULT_OUTPUT: path.join(dir, 'login-result.json')
  };
}

test('devtools verifier prints a copyable preview command without launching preview', () => {
  const fakeCli = createFakeCli();
  const result = spawnSync(process.execPath, ['tests/verify-devtools-cli.js'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      WECHAT_DEVTOOLS_CLI: fakeCli,
      ...createPreviewOutputEnv()
    }
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0);
  assert.match(output, /OK WeChat DevTools CLI is available/);
  assert.match(output, /Preview command/);
  assert.match(output, /preview/);
  assert.match(output, /--project/);
  assert.match(output, /pension-devtools-preview-/);
  assert.match(output, /preview\.png/);
  assert.match(output, /preview\.json/);
  assert.match(output, /non-sandboxed, logged-in desktop/);
});

test('devtools verifier fails with a clear message when cli is missing', () => {
  const missingCliPath = path.join(root, '.tmp-missing-wechat-devtools-cli');
  const result = spawnSync(process.execPath, ['tests/verify-devtools-cli.js'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      WECHAT_DEVTOOLS_CLI: missingCliPath
    }
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /WeChat DevTools CLI missing/);
  assert.match(output, /Set WECHAT_DEVTOOLS_CLI/);
});

test('devtools preview verifier fails when preview artifacts are not generated', () => {
  const fakeCli = createFakeCli();
  const result = spawnSync(process.execPath, ['tests/verify-devtools-cli.js', '--preview'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      WECHAT_DEVTOOLS_CLI: fakeCli,
      ...createPreviewOutputEnv()
    }
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /WeChat DevTools preview artifacts missing/);
  assert.match(output, /pension-devtools-preview-/);
  assert.match(output, /preview\.png/);
  assert.match(output, /preview\.json/);
  assert.match(output, /DevTools is logged in/);
});

test('devtools preview verifier preserves existing artifacts when preview generation fails', () => {
  const fakeCli = createFailingPreviewCli();
  const previewEnv = createPreviewOutputEnv();
  fs.mkdirSync(path.dirname(previewEnv.PENSION_DEVTOOLS_PREVIEW_QR_OUTPUT), { recursive: true });
  fs.writeFileSync(previewEnv.PENSION_DEVTOOLS_PREVIEW_QR_OUTPUT, 'existing qr');
  fs.writeFileSync(previewEnv.PENSION_DEVTOOLS_PREVIEW_INFO_OUTPUT, '{"existing":true}');

  const result = spawnSync(process.execPath, ['tests/verify-devtools-cli.js', '--preview'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      WECHAT_DEVTOOLS_CLI: fakeCli,
      ...previewEnv
    }
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /WeChat DevTools preview failed/);
  assert.equal(fs.readFileSync(previewEnv.PENSION_DEVTOOLS_PREVIEW_QR_OUTPUT, 'utf8'), 'existing qr');
  assert.equal(fs.readFileSync(previewEnv.PENSION_DEVTOOLS_PREVIEW_INFO_OUTPUT, 'utf8'), '{"existing":true}');
});

test('devtools login helper generates a local QR and result file', () => {
  const fakeCli = createLoginCli();
  const loginEnv = createLoginOutputEnv();
  const result = spawnSync(process.execPath, ['tests/devtools-login.js'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      WECHAT_DEVTOOLS_CLI: fakeCli,
      ...loginEnv
    }
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0, output);
  assert.match(output, /OK WeChat DevTools login QR generated/);
  assert.equal(fs.readFileSync(loginEnv.PENSION_DEVTOOLS_LOGIN_QR_OUTPUT, 'utf8'), 'fake login qr');
  assert.equal(fs.readFileSync(loginEnv.PENSION_DEVTOOLS_LOGIN_RESULT_OUTPUT, 'utf8'), '{"login":true}');
});

test('devtools diagnostics report stale IDE port file', () => {
  const diagnostics = collectIdePortDiagnostics({
    idePortFile: '/tmp/fake-devtools/.ide',
    readIdePortFn: () => 9420,
    isPortListening: () => false
  });

  assert.equal(diagnostics.idePort, 9420);
  assert.ok(diagnostics.warnings.some((warning) => /no local service is listening/.test(warning)));
});

test('devtools diagnostics report listening IDE port', () => {
  const diagnostics = collectIdePortDiagnostics({
    idePortFile: '/tmp/fake-devtools/.ide',
    readIdePortFn: () => 9420,
    isPortListening: () => true
  });

  assert.equal(diagnostics.idePort, 9420);
  assert.ok(diagnostics.passed.some((item) => /IDE service port is listening/.test(item)));
  assert.deepEqual(diagnostics.warnings, []);
});

test('devtools diagnostics handle missing IDE port file', () => {
  const missingFile = path.join(os.tmpdir(), `missing-devtools-${Date.now()}.ide`);

  assert.equal(readIdePort({ idePortFile: missingFile }), null);
  const diagnostics = collectIdePortDiagnostics({ idePortFile: missingFile });

  assert.equal(diagnostics.idePort, null);
  assert.ok(diagnostics.warnings.some((warning) => /port file is missing or invalid/.test(warning)));
});

test('devtools diagnostics block release when CLI login is expired', () => {
  const cliPath = process.execPath;
  const diagnostics = collectLoginDiagnostics({
    cliPath,
    execFile: () => '- preparing\n{"login":false}\n✔ islogin\n'
  });

  assert.equal(diagnostics.isLoggedIn, false);
  assert.ok(diagnostics.blockers.some((item) => /not logged in/.test(item)));
});
