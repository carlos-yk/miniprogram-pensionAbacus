const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  collectDeviceQaEvidenceContentIssues,
  getLatestWatchedContentChange,
  requiredChecks
} = require('./lib/deviceQaEvidence');

const root = path.resolve(__dirname, '..');

test('device QA verifier prints actionable evidence instructions when evidence is missing', () => {
  const result = spawnSync(process.execPath, ['tests/verify-device-qa.js'], {
    cwd: root,
    encoding: 'utf8'
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /Device QA evidence blockers/);
  assert.match(output, /Device QA next steps/);
  assert.match(output, /npm run qa:devtools-login/);
  assert.match(output, /npm run qa:device-evidence:init/);
  assert.match(output, /npm run verify:devtools:preview/);
  assert.match(output, /qa\/device-qa-evidence\.example\.json/);
  assert.match(output, /qa\/device-qa-evidence\.json/);
  assert.match(output, /Required platforms: iOS, Android/);
  assert.match(output, /preview QR and info files must exist/);
  assert.match(output, /device screenshots must exist/);
  assert.match(output, /首页只开放城镇职工入口/);
  assert.match(output, /分享不包含敏感金额或输入信息/);
  assert.match(output, /上海个人账户余额查询路径可见/);
  assert.match(output, /数据来源、隐私说明、免责声明可阅读/);
});

test('device QA evidence requires preview and device artifact files', () => {
  const evidence = {
    schemaVersion: '1.0',
    releaseCity: 'shanghai',
    testedAt: new Date(Date.now() + 1000).toISOString(),
    tester: 'QA Tester',
    devtools: {
      previewGenerated: true,
      qrOutput: '/tmp/missing-pension-preview.png',
      infoOutput: '/tmp/missing-pension-preview.json'
    },
    devices: [
      {
        platform: 'iOS',
        model: 'iPhone 15',
        osVersion: 'iOS 18.5',
        wechatVersion: '8.0.58',
        screenshot: '/tmp/missing-ios-smoke.png',
        result: 'pass'
      },
      {
        platform: 'Android',
        model: 'Pixel 8',
        osVersion: 'Android 15',
        wechatVersion: '8.0.58',
        screenshot: '/tmp/missing-android-smoke.png',
        result: 'pass'
      }
    ],
    checks: {
      homeEmployeeEntryOnly: true,
      disabledFutureModules: true,
      coreHistoricalGapsBlocked: true,
      nonCoreHistoricalGapsSoftPrompt: true,
      requiredFormValidation: true,
      femaleRetirementTwoColumnLayout: true,
      accountBalanceFlow: true,
      resultExplanationVisible: true,
      shanghaiAccountLookupGuideVisible: true,
      aboutDataSourceAndDisclaimerVisible: true,
      sharePrivacySafe: true,
      noForbiddenCompetitionCopy: true,
      largeFontReadable: true,
      keyboardAndSafeAreaOk: true,
      iosSmokePass: true,
      androidSmokePass: true
    }
  };

  const { blockers } = collectDeviceQaEvidenceContentIssues(evidence, {
    latestChange: null,
    artifactExists: () => false
  });

  assert.match(blockers.join('\n'), /devtools\.qrOutput file must exist/);
  assert.match(blockers.join('\n'), /devtools\.infoOutput file must exist/);
  assert.match(blockers.join('\n'), /iOS device screenshot file must exist/);
  assert.match(blockers.join('\n'), /Android device screenshot file must exist/);
});

test('device QA example template lists every check but does not pre-approve device work', () => {
  const example = JSON.parse(
    fs.readFileSync(path.join(root, 'qa/device-qa-evidence.example.json'), 'utf8')
  );

  assert.equal(example.devtools.previewGenerated, false);
  assert.deepEqual(Object.keys(example.checks).sort(), requiredChecks.slice().sort());
  for (const check of requiredChecks) {
    assert.equal(example.checks[check], false, `${check} should default to false`);
  }
});

test('device QA evidence initializer creates a conservative draft without overwriting evidence', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-device-qa-'));
  const outputPath = path.join(tempDir, 'device-qa-evidence.json');

  const result = spawnSync(process.execPath, [
    'tests/init-device-qa-evidence.js',
    '--output',
    outputPath,
    '--tested-at',
    '2026-06-05T08:00:00.000Z'
  ], {
    cwd: root,
    encoding: 'utf8'
  });

  const output = `${result.stdout}\n${result.stderr}`;
  assert.equal(result.status, 0, output);
  assert.match(output, /Created device QA evidence draft/);
  assert.match(output, /npm run verify:devtools:preview/);
  assert.match(output, /npm run verify:device-qa/);

  const draft = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  assert.equal(draft.schemaVersion, '1.0');
  assert.equal(draft.releaseCity, 'shanghai');
  assert.equal(draft.testedAt, '2026-06-05T08:00:00.000Z');
  assert.equal(draft.devtools.previewGenerated, false);
  assert.match(draft.devtools.qrOutput, /qa\/artifacts\/devtools\/preview\.png$/);
  assert.match(draft.devtools.infoOutput, /qa\/artifacts\/devtools\/preview\.json$/);
  assert.deepEqual(Object.keys(draft.checks).sort(), requiredChecks.slice().sort());
  for (const check of requiredChecks) {
    assert.equal(draft.checks[check], false, `${check} should default to false`);
  }

  const secondRun = spawnSync(process.execPath, [
    'tests/init-device-qa-evidence.js',
    '--output',
    outputPath
  ], {
    cwd: root,
    encoding: 'utf8'
  });
  const secondOutput = `${secondRun.stdout}\n${secondRun.stderr}`;

  assert.equal(secondRun.status, 1, secondOutput);
  assert.match(secondOutput, /already exists/);
  assert.match(secondOutput, /--force/);
});

test('device QA evidence completer refuses to mark pass without real-device confirmation', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-device-qa-complete-'));
  const evidencePath = path.join(tempDir, 'device-qa-evidence.json');
  const iosScreenshot = path.join(tempDir, 'ios.png');
  const androidScreenshot = path.join(tempDir, 'android.png');
  fs.writeFileSync(iosScreenshot, 'ios screenshot');
  fs.writeFileSync(androidScreenshot, 'android screenshot');

  const initResult = spawnSync(process.execPath, [
    'tests/init-device-qa-evidence.js',
    '--output',
    evidencePath,
    '--tested-at',
    '2026-06-05T08:00:00.000Z'
  ], {
    cwd: root,
    encoding: 'utf8'
  });
  assert.equal(initResult.status, 0, `${initResult.stdout}\n${initResult.stderr}`);

  const result = spawnSync(process.execPath, [
    'tests/complete-device-qa-evidence.js',
    '--output',
    evidencePath,
    '--tester',
    'QA Tester',
    '--ios-model',
    'iPhone 15',
    '--ios-os',
    'iOS 18.5',
    '--ios-wechat',
    '8.0.58',
    '--ios-screenshot',
    iosScreenshot,
    '--android-model',
    'Pixel 8',
    '--android-os',
    'Android 15',
    '--android-wechat',
    '8.0.58',
    '--android-screenshot',
    androidScreenshot
  ], {
    cwd: root,
    encoding: 'utf8'
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1, output);
  assert.match(output, /--confirm-real-device/);

  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  assert.equal(evidence.tester, 'name');
  assert.equal(evidence.devices[0].result, 'pending');
});

test('device QA evidence completer writes passing evidence after explicit real-device confirmation', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pension-device-qa-complete-'));
  const evidencePath = path.join(tempDir, 'device-qa-evidence.json');
  const qrOutput = path.join(tempDir, 'preview.png');
  const infoOutput = path.join(tempDir, 'preview.json');
  const iosScreenshot = path.join(tempDir, 'ios.png');
  const androidScreenshot = path.join(tempDir, 'android.png');
  fs.writeFileSync(qrOutput, 'preview qr');
  fs.writeFileSync(infoOutput, '{"size":{"total":1}}');
  fs.writeFileSync(iosScreenshot, 'ios screenshot');
  fs.writeFileSync(androidScreenshot, 'android screenshot');

  const initResult = spawnSync(process.execPath, [
    'tests/init-device-qa-evidence.js',
    '--output',
    evidencePath,
    '--tested-at',
    '2026-06-05T08:00:00.000Z'
  ], {
    cwd: root,
    encoding: 'utf8'
  });
  assert.equal(initResult.status, 0, `${initResult.stdout}\n${initResult.stderr}`);

  const result = spawnSync(process.execPath, [
    'tests/complete-device-qa-evidence.js',
    '--output',
    evidencePath,
    '--tested-at',
    '2026-06-05T09:00:00.000Z',
    '--tester',
    'QA Tester',
    '--qr-output',
    qrOutput,
    '--info-output',
    infoOutput,
    '--ios-model',
    'iPhone 15',
    '--ios-os',
    'iOS 18.5',
    '--ios-wechat',
    '8.0.58',
    '--ios-screenshot',
    iosScreenshot,
    '--android-model',
    'Pixel 8',
    '--android-os',
    'Android 15',
    '--android-wechat',
    '8.0.58',
    '--android-screenshot',
    androidScreenshot,
    '--confirm-real-device'
  ], {
    cwd: root,
    encoding: 'utf8'
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0, output);
  assert.match(output, /Updated device QA evidence/);
  assert.match(output, /npm run verify:device-qa/);

  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  assert.equal(evidence.testedAt, '2026-06-05T09:00:00.000Z');
  assert.equal(evidence.tester, 'QA Tester');
  assert.equal(evidence.devtools.previewGenerated, true);
  assert.equal(evidence.devtools.qrOutput, qrOutput);
  assert.equal(evidence.devtools.infoOutput, infoOutput);
  assert.equal(evidence.devices.find((device) => device.platform === 'iOS').result, 'pass');
  assert.equal(evidence.devices.find((device) => device.platform === 'Android').result, 'pass');
  for (const check of requiredChecks) {
    assert.equal(evidence.checks[check], true, `${check} should be true`);
  }
});

test('package exposes device QA helper commands', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  assert.equal(
    packageJson.scripts['qa:devtools-login'],
    'node tests/devtools-login.js'
  );
  assert.equal(
    packageJson.scripts['qa:device-evidence:init'],
    'node tests/init-device-qa-evidence.js'
  );
  assert.equal(
    packageJson.scripts['qa:device-evidence:complete'],
    'node tests/complete-device-qa-evidence.js'
  );
});

test('device QA freshness uses committed content time for clean watched files', () => {
  const latestChange = getLatestWatchedContentChange({
    hasDiff: () => false,
    getCommittedChangeMs: (file) => file === 'project.config.json'
      ? Date.parse('2026-06-01T00:00:00.000Z')
      : Date.parse('2026-05-01T00:00:00.000Z')
  });

  assert.equal(latestChange.path, 'project.config.json');
  assert.equal(latestChange.mtimeMs, Date.parse('2026-06-01T00:00:00.000Z'));
});

test('device QA freshness uses filesystem mtime when watched file has content diff', () => {
  const latestChange = getLatestWatchedContentChange({
    hasDiff: (file) => file === 'project.config.json',
    getCommittedChangeMs: () => Date.parse('2020-01-01T00:00:00.000Z')
  });

  assert.equal(latestChange.path, 'project.config.json');
  assert.ok(latestChange.mtimeMs > Date.parse('2020-01-01T00:00:00.000Z'));
});

test('QA privacy verifier protects local evidence while keeping release assets trackable', () => {
  const result = spawnSync(process.execPath, ['tests/verify-qa-privacy.js'], {
    cwd: root,
    encoding: 'utf8'
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0, output);
  assert.match(output, /OK QA evidence privacy and release asset git hygiene/);
  assert.match(output, /qa\/device-qa-evidence\.json is ignored/);
  assert.match(output, /miniprogram\/assets\/release-assets\.json is trackable/);
});

test('package exposes QA privacy verifier and runs it in the default verify command', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  assert.equal(packageJson.scripts['verify:qa-privacy'], 'node tests/verify-qa-privacy.js');
  assert.match(packageJson.scripts.verify, /npm run verify:qa-privacy/);
});
