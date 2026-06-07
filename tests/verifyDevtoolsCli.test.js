const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function createFakeCli() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-devtools-cli-'));
  const cliPath = path.join(dir, 'cli');
  fs.writeFileSync(cliPath, '#!/bin/sh\nif [ "$1" = "--help" ]; then exit 0; fi\necho "$@"\nexit 0\n');
  fs.chmodSync(cliPath, 0o755);
  return cliPath;
}

test('devtools verifier prints a copyable preview command without launching preview', () => {
  const fakeCli = createFakeCli();
  const result = spawnSync(process.execPath, ['tests/verify-devtools-cli.js'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      WECHAT_DEVTOOLS_CLI: fakeCli
    }
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0);
  assert.match(output, /OK WeChat DevTools CLI is available/);
  assert.match(output, /Preview command/);
  assert.match(output, /preview/);
  assert.match(output, /--project/);
  assert.match(output, /pension-abacus-preview\.png/);
  assert.match(output, /pension-abacus-preview\.json/);
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
      WECHAT_DEVTOOLS_CLI: fakeCli
    }
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /WeChat DevTools preview artifacts missing/);
  assert.match(output, /pension-abacus-preview\.png/);
  assert.match(output, /pension-abacus-preview\.json/);
  assert.match(output, /DevTools is logged in/);
});
