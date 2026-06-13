const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildReleaseNextActions } = require('./lib/releaseNextActions');
const { collectReleaseSupportFileIssues } = require('./lib/releaseSupportFiles');
const { collectReleaseWorktreeIssues } = require('./lib/releaseWorktree');

const root = path.resolve(__dirname, '..');

test('release readiness verifier prints actionable next steps for blockers', () => {
  const result = spawnSync(process.execPath, ['tests/verify-release-readiness.js'], {
    cwd: root,
    encoding: 'utf8'
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /Release blockers/);
  assert.match(output, /Historical backlog outside public supported range: 2000-2007, 2013/);
  assert.match(output, /Release readiness next actions/);
  assert.doesNotMatch(output, /\[data\/P0\] 补齐并复核上海首开数据/);
  assert.doesNotMatch(output, /Tasks: 19 in data\/generated\/city-data-backfill-tasks\.json/);
  assert.doesNotMatch(output, /data:shanghai:2000:fill-missing-fields/);
  assert.doesNotMatch(output, /data:shanghai:2001:fill-missing-fields/);
  assert.doesNotMatch(output, /source-production-review/);
  assert.doesNotMatch(output, /data:shanghai:2001:production-ready-review/);
  assert.match(output, /npm run qa:device-evidence:init/);
  assert.match(output, /npm run verify:devtools:preview/);
  assert.match(output, /qa\/device-qa-evidence\.json/);
  assert.match(output, /Artifacts: devtools\.qrOutput, devtools\.infoOutput, device\.screenshot files must exist/);
});

test('release status json exposes owner-based next actions', () => {
  const result = spawnSync(process.execPath, ['tests/print-release-status.js', '--json'], {
    cwd: root,
    encoding: 'utf8'
  });

  assert.equal(result.status, 0);
  const report = JSON.parse(result.stdout);
  assert.equal(report.conclusion, 'BLOCKED');
  assert.ok(Array.isArray(report.nextActions));

  const qaAction = report.nextActions.find((action) => action.owner === 'qa');
  assert.ok(qaAction);
  const cityGateSection = report.sections.find((section) => section.title === 'City Gate');
  const shanghaiDataSection = report.sections.find((section) => section.title === 'Shanghai Data');
  const dataBackfillSection = report.sections.find((section) => section.title === 'Data Backfill Tasks');

  assert.ok(cityGateSection.passed.some((item) => /上海/.test(item)));
  assert.equal(shanghaiDataSection.blockers.length, 0);
  assert.ok(shanghaiDataSection.warnings.some((item) =>
    /Historical backlog outside public supported range/.test(item)
  ));
  assert.ok(dataBackfillSection.passed.some((item) => /no P0 data backfill tasks/.test(item)));
  assert.equal(qaAction.evidencePath, 'qa/device-qa-evidence.json');
  assert.equal(qaAction.draftCommand, 'npm run qa:device-evidence:init');
  assert.ok(qaAction.artifactRequirements.includes('devtools.qrOutput'));
  assert.ok(qaAction.artifactRequirements.includes('device.screenshot'));
  assert.match(qaAction.loginCommand, /login/);
  assert.match(qaAction.loginCommand, /qa\/artifacts\/devtools\/login\.png/);
  assert.match(qaAction.previewCommand, /preview/);
  assert.match(qaAction.previewCommand, /qa\/artifacts\/devtools\/preview\.png/);
  assert.ok(qaAction.requiredChecks.some((check) => check.key === 'noForbiddenCompetitionCopy'));
  assert.ok(qaAction.requiredChecks.some((check) => check.key === 'shanghaiAccountLookupGuideVisible'));
  assert.ok(qaAction.requiredChecks.some((check) => check.key === 'aboutDataSourceAndDisclaimerVisible'));
});

test('release next actions include git command when release files are not clean', () => {
  const actions = buildReleaseNextActions({
    assetIssues: {
      missing: [],
      untracked: ['miniprogram/assets/release-assets.json'],
      modified: ['miniprogram/assets/logo-pension-abacus.png'],
      invalid: []
    },
    cityDataIssues: { blockers: [], warnings: [] },
    dataBackfillSummary: {
      totalTasks: 0,
      byType: {},
      visibleTasks: [],
      remainingHiddenTasks: 0,
      reportPath: 'data/generated/city-data-backfill-tasks.json'
    },
    devtoolsIssues: { blockers: [], warnings: [], loginCommand: 'login command', previewCommand: 'preview command' },
    deviceQaIssues: {
      blockers: [],
      warnings: [],
      evidencePath: 'qa/device-qa-evidence.json',
      examplePath: 'qa/device-qa-evidence.example.json'
    },
    supportFileIssues: {
      missing: [],
      untracked: ['docs/16-release-readiness-and-device-qa.md'],
      modified: ['package.json']
    },
    worktreeIssues: {
      modified: ['miniprogram/utils/dataGate.js'],
      untracked: ['tests/verify-release-readiness.js']
    }
  });

  const gitAction = actions.find((action) => action.owner === 'git');
  assert.equal(gitAction.priority, 'P0');
  assert.match(gitAction.command, /git add/);
  assert.match(gitAction.command, /miniprogram\/assets\/release-assets\.json/);
  assert.match(gitAction.command, /miniprogram\/assets\/logo-pension-abacus\.png/);
  assert.match(gitAction.command, /docs\/16-release-readiness-and-device-qa\.md/);
  assert.match(gitAction.command, /package\.json/);
  assert.match(gitAction.command, /miniprogram\/utils\/dataGate\.js/);
  assert.match(gitAction.command, /tests\/verify-release-readiness\.js/);
});

test('release readiness blocks when devtools cli precondition is missing', () => {
  const missingCliPath = path.join(root, '.tmp-missing-wechat-devtools-cli');
  const result = spawnSync(process.execPath, ['tests/verify-release-readiness.js'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      WECHAT_DEVTOOLS_CLI: missingCliPath
    }
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1);
  assert.match(output, /Device QA precondition: WeChat DevTools CLI missing/);
  assert.match(output, /Release readiness next actions/);
});

test('release docs include the device QA evidence initializer command', () => {
  const releaseDoc = fs.readFileSync(
    path.join(root, 'docs/16-release-readiness-and-device-qa.md'),
    'utf8'
  );
  const readme = fs.readFileSync(path.join(root, 'docs/README.md'), 'utf8');

  assert.match(releaseDoc, /npm run qa:device-evidence:init/);
  assert.match(releaseDoc, /previewGenerated=true only after/i);
  assert.match(releaseDoc, /checks\.\*.*true.*真实/i);
  assert.match(releaseDoc, /发布支持文件/);
  assert.match(releaseDoc, /qa\/device-qa-evidence\.example\.json/);
  assert.match(readme, /npm run qa:device-evidence:init/);
});

test('release support file checker reports tracked files with local modifications', () => {
  const issues = collectReleaseSupportFileIssues({
    requiredFiles: ['package.json', 'docs/16-release-readiness-and-device-qa.md'],
    fileExists: () => true,
    isGitTracked: () => true,
    isGitModified: (file) => file === 'package.json'
  });

  assert.deepEqual(issues.modified, ['package.json']);
});

test('release worktree checker reports product changes while ignoring local device evidence', () => {
  const issues = collectReleaseWorktreeIssues({
    getStatusOutput: () => [
      ' M miniprogram/utils/dataGate.js',
      ' M data/official/city-params.json',
      '?? docs/pa_logo.png',
      '?? qa/device-qa-evidence.json',
      '?? qa/artifacts/ios-main-flow.png'
    ].join('\n')
  });

  assert.deepEqual(issues.modified, [
    'miniprogram/utils/dataGate.js',
    'data/official/city-params.json'
  ]);
  assert.deepEqual(issues.untracked, ['docs/pa_logo.png']);
});
