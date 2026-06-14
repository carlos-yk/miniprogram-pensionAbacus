const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { defaultReleaseCity } = require('./cityDataReadiness');

const root = path.resolve(__dirname, '..', '..');
const evidencePath = 'qa/device-qa-evidence.json';
const examplePath = 'qa/device-qa-evidence.example.json';
const watchedPaths = [
  'project.config.json',
  'miniprogram/app.js',
  'miniprogram/app.json',
  'miniprogram/app.wxss',
  'miniprogram/assets',
  'miniprogram/config',
  'miniprogram/data',
  'miniprogram/pages',
  'miniprogram/sitemap.json',
  'miniprogram/utils',
  'data/official',
  'data/generated'
];
const ignoredWatchedPaths = new Set([
  'miniprogram/project.private.config.json'
]);
const requiredPlatforms = ['iOS', 'Android'];
const requiredChecks = [
  'homeEmployeeEntryOnly',
  'disabledFutureModules',
  'coreHistoricalGapsBlocked',
  'nonCoreHistoricalGapsSoftPrompt',
  'requiredFormValidation',
  'femaleRetirementTwoColumnLayout',
  'accountBalanceFlow',
  'resultExplanationVisible',
  'shanghaiAccountLookupGuideVisible',
  'aboutDataSourceAndDisclaimerVisible',
  'sharePrivacySafe',
  'noForbiddenCompetitionCopy',
  'largeFontReadable',
  'keyboardAndSafeAreaOk',
  'iosSmokePass',
  'androidSmokePass'
];
const requiredCheckLabels = {
  homeEmployeeEntryOnly: '首页只开放城镇职工入口',
  disabledFutureModules: '长期规划模块置灰并提示敬请期待',
  coreHistoricalGapsBlocked: '触达核心历史参数缺失年份的输入不能提交测算',
  nonCoreHistoricalGapsSoftPrompt: '仅缺非核心历史参数时出现软提示并允许继续估算',
  requiredFormValidation: '出生年月、退休类型、城市、缴费年限、缴费水平必填校验通过',
  femaleRetirementTwoColumnLayout: '女性退休类型两列布局展示正常',
  accountBalanceFlow: '个人账户余额填写、跳过和返回流程正常',
  resultExplanationVisible: '结果页解释、关键假设和重要提示可见',
  shanghaiAccountLookupGuideVisible: '上海个人账户余额查询路径可见',
  aboutDataSourceAndDisclaimerVisible: '数据来源、隐私说明、免责声明可阅读',
  sharePrivacySafe: '分享不包含敏感金额或输入信息',
  noForbiddenCompetitionCopy: '不出现竞争力、百分位、排行榜、奖杯、烟花、彩带等禁用内容',
  largeFontReadable: '大字号模式文字可读且不重叠',
  keyboardAndSafeAreaOk: '键盘弹起和底部安全区不遮挡关键操作',
  iosSmokePass: 'iOS 真机主流程通过',
  androidSmokePass: 'Android 真机主流程通过'
};
const completeEvidenceCommand = [
  'npm run qa:device-evidence:complete --',
  '--tester "测试人姓名"',
  '--ios-model "iPhone 机型"',
  '--ios-os "iOS 版本"',
  '--ios-wechat "微信版本"',
  '--ios-screenshot "qa/artifacts/ios-main-flow.png"',
  '--android-model "Android 机型"',
  '--android-os "Android 版本"',
  '--android-wechat "微信版本"',
  '--android-screenshot "qa/artifacts/android-main-flow.png"',
  '--confirm-real-device'
].join(' ');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function isFilled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasPlaceholder(value) {
  return /^(name|iPhone|Android phone|iOS version|Android version|WeChat version)$/i.test(String(value || '').trim());
}

function resolveArtifactPath(value) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function defaultArtifactExists(value) {
  return isFilled(value) && fs.existsSync(resolveArtifactPath(value));
}

function walkFiles(relativePath, files) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return;

  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) {
    if (!ignoredWatchedPaths.has(relativePath)) {
      files.push(relativePath);
    }
    return;
  }

  if (!stat.isDirectory()) return;

  for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
    walkFiles(path.join(relativePath, entry.name), files);
  }
}

function getLatestWatchedFileChange() {
  const files = [];
  for (const watchedPath of watchedPaths) {
    walkFiles(watchedPath, files);
  }

  let latest = null;
  for (const file of files) {
    const stat = fs.statSync(path.join(root, file));
    if (!latest || stat.mtimeMs > latest.mtimeMs) {
      latest = {
        path: file,
        mtimeMs: stat.mtimeMs,
        mtimeIso: new Date(stat.mtimeMs).toISOString()
      };
    }
  }

  return latest;
}

function hasGitDiff(relativePath) {
  try {
    execFileSync('git', ['diff', '--quiet', '--', relativePath], {
      cwd: root,
      stdio: 'ignore'
    });
    execFileSync('git', ['diff', '--cached', '--quiet', '--', relativePath], {
      cwd: root,
      stdio: 'ignore'
    });
    return false;
  } catch (error) {
    return true;
  }
}

function getLastCommittedChangeMs(relativePath) {
  try {
    const output = execFileSync('git', ['log', '-1', '--format=%cI', '--', relativePath], {
      cwd: root,
      encoding: 'utf8'
    }).trim();
    const timestamp = Date.parse(output);
    return Number.isFinite(timestamp) ? timestamp : null;
  } catch (error) {
    return null;
  }
}

function getLatestWatchedContentChange({
  hasDiff = hasGitDiff,
  getCommittedChangeMs = getLastCommittedChangeMs
} = {}) {
  const files = [];
  for (const watchedPath of watchedPaths) {
    walkFiles(watchedPath, files);
  }

  let latest = null;
  for (const file of files) {
    const stat = fs.statSync(path.join(root, file));
    const committedChangeMs = getCommittedChangeMs(file);
    const contentChangeMs = hasDiff(file) || committedChangeMs === null
      ? stat.mtimeMs
      : committedChangeMs;

    if (!latest || contentChangeMs > latest.mtimeMs) {
      latest = {
        path: file,
        mtimeMs: contentChangeMs,
        mtimeIso: new Date(contentChangeMs).toISOString()
      };
    }
  }

  return latest;
}

function addArtifactBlockers(blockers, label, artifactPath, artifactExists) {
  if (!isFilled(artifactPath) || hasPlaceholder(artifactPath)) {
    blockers.push(`Device QA evidence must include ${label}`);
    return;
  }

  if (!artifactExists(artifactPath)) {
    blockers.push(`Device QA ${label} file must exist: ${artifactPath}`);
  }
}

function collectDeviceQaEvidenceContentIssues(
  evidence,
  {
    latestChange = getLatestWatchedContentChange(),
    artifactExists = defaultArtifactExists
  } = {}
) {
  const blockers = [];
  const warnings = [];

  if (evidence.schemaVersion !== '1.0') {
    blockers.push(`Device QA evidence schemaVersion must be 1.0, got ${evidence.schemaVersion || 'missing'}`);
  }

  if (evidence.releaseCity !== defaultReleaseCity) {
    blockers.push(`Device QA releaseCity must be ${defaultReleaseCity}, got ${evidence.releaseCity || 'missing'}`);
  }

  const testedAtMs = isFilled(evidence.testedAt) ? Date.parse(evidence.testedAt) : Number.NaN;
  if (Number.isNaN(testedAtMs)) {
    blockers.push('Device QA testedAt must be a valid ISO date string');
  } else if (latestChange && testedAtMs < latestChange.mtimeMs) {
    blockers.push(
      `Device QA evidence is stale: testedAt ${evidence.testedAt} is older than ${latestChange.path} (${latestChange.mtimeIso})`
    );
  }

  if (!isFilled(evidence.tester) || hasPlaceholder(evidence.tester)) {
    blockers.push('Device QA tester must be filled with a real tester name');
  }

  const devtools = evidence.devtools || {};
  if (devtools.previewGenerated !== true) {
    blockers.push('Device QA evidence must confirm devtools.previewGenerated=true');
  }
  if (!isFilled(devtools.qrOutput)) {
    blockers.push('Device QA evidence must include devtools.qrOutput');
  } else {
    addArtifactBlockers(blockers, 'devtools.qrOutput', devtools.qrOutput, artifactExists);
  }
  if (!isFilled(devtools.infoOutput)) {
    blockers.push('Device QA evidence must include devtools.infoOutput');
  } else {
    addArtifactBlockers(blockers, 'devtools.infoOutput', devtools.infoOutput, artifactExists);
  }

  const devices = Array.isArray(evidence.devices) ? evidence.devices : [];
  if (devices.length === 0) {
    blockers.push('Device QA evidence must include tested devices');
  }

  for (const platform of requiredPlatforms) {
    const device = devices.find((item) => item.platform === platform && item.result === 'pass');
    if (!device) {
      blockers.push(`Device QA must include a passing ${platform} device`);
      continue;
    }

    for (const field of ['model', 'osVersion', 'wechatVersion']) {
      if (!isFilled(device[field]) || hasPlaceholder(device[field])) {
        blockers.push(`Device QA ${platform} device must include a real ${field}`);
      }
    }

    addArtifactBlockers(blockers, `${platform} device screenshot`, device.screenshot, artifactExists);
  }

  const checks = evidence.checks || {};
  for (const check of requiredChecks) {
    if (checks[check] !== true) {
      blockers.push(`Device QA check must pass: ${check}`);
    }
  }

  return { evidencePath, examplePath, blockers, warnings };
}

function collectDeviceQaEvidenceIssues() {
  const blockers = [];
  const warnings = [];

  if (!fs.existsSync(path.join(root, examplePath))) {
    blockers.push(`Device QA evidence template is missing: ${examplePath}`);
  }

  if (!fs.existsSync(path.join(root, evidencePath))) {
    blockers.push(`Device QA evidence is missing: ${evidencePath}`);
    return { evidencePath, examplePath, blockers, warnings };
  }

  let evidence;
  try {
    evidence = readJson(evidencePath);
  } catch (error) {
    blockers.push(`Device QA evidence is not valid JSON: ${evidencePath}`);
    return { evidencePath, examplePath, blockers, warnings };
  }

  const contentIssues = collectDeviceQaEvidenceContentIssues(evidence);
  return {
    evidencePath,
    examplePath,
    blockers: blockers.concat(contentIssues.blockers),
    warnings: warnings.concat(contentIssues.warnings)
  };
}

module.exports = {
  collectDeviceQaEvidenceContentIssues,
  collectDeviceQaEvidenceIssues,
  completeEvidenceCommand,
  evidencePath,
  examplePath,
  getLatestWatchedContentChange,
  getLatestWatchedFileChange,
  requiredCheckLabels,
  requiredChecks,
  requiredPlatforms,
  watchedPaths
};
