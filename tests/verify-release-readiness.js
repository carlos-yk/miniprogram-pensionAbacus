const features = require('../miniprogram/config/features');
const {
  benchmarkMeta
} = require('../miniprogram/data/runtime-data');
const { getCityGateOptions } = require('../miniprogram/utils/dataGate');
const { collectCityDataReadinessIssues, defaultReleaseCity } = require('./lib/cityDataReadiness');
const { collectDataBackfillTaskSummary } = require('./lib/dataBackfillTasks');
const { collectDevtoolsPreconditionIssues } = require('./lib/devtoolsPreconditions');
const {
  collectDeviceQaEvidenceIssues
} = require('./lib/deviceQaEvidence');
const { buildReleaseNextActions, printReleaseNextActions } = require('./lib/releaseNextActions');
const { collectReleaseAssetIssues } = require('./lib/releaseAssets');
const { collectReleaseSupportFileIssues } = require('./lib/releaseSupportFiles');
const { collectReleaseWorktreeIssues } = require('./lib/releaseWorktree');

const blockers = [];
const warnings = [];

function addBlocker(message) {
  blockers.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

const assetIssues = collectReleaseAssetIssues();
const supportFileIssues = collectReleaseSupportFileIssues();
const worktreeIssues = collectReleaseWorktreeIssues();
for (const asset of assetIssues.missing) {
  addBlocker(`Required release asset is missing: ${asset}`);
}
for (const asset of assetIssues.untracked) {
  addBlocker(`Required release asset is not tracked by git: ${asset}`);
}
for (const asset of assetIssues.modified) {
  addBlocker(`Required release asset has local changes not staged/committed: ${asset}`);
}
for (const issue of assetIssues.invalid) {
  addBlocker(`Release asset manifest issue: ${issue}`);
}
for (const file of supportFileIssues.missing) {
  addBlocker(`Required release support file is missing: ${file}`);
}
for (const file of supportFileIssues.untracked) {
  addBlocker(`Required release support file is not tracked by git: ${file}`);
}
for (const file of supportFileIssues.modified) {
  addBlocker(`Required release support file has local changes not staged/committed: ${file}`);
}
for (const file of worktreeIssues.modified) {
  addBlocker(`Release worktree file has local changes not staged/committed: ${file}`);
}
for (const file of worktreeIssues.untracked) {
  addBlocker(`Release worktree file is untracked: ${file}`);
}

if (features.releaseProfile !== 'public') {
  addBlocker(`releaseProfile must be public for release readiness, got ${features.releaseProfile}`);
}

if (features.internalPreviewEnabled) {
  addBlocker('internalPreviewEnabled must be false for public release readiness');
}

if (features.monetizationEnabled) {
  addBlocker('monetizationEnabled must remain false for V1 release readiness');
}

if (features.competitionEnabled) {
  addBlocker('competitionEnabled must remain false for V1 release readiness');
}

const publicCityOptions = getCityGateOptions();
const openCities = publicCityOptions.filter((city) => city.canSubmit);
if (openCities.length === 0) {
  addBlocker('No city is open for public calculation');
}

const cityDataIssues = collectCityDataReadinessIssues(defaultReleaseCity);
const dataBackfillSummary = collectDataBackfillTaskSummary({
  city: defaultReleaseCity,
  priority: 'P0',
  limit: 6
});
for (const issue of cityDataIssues.blockers) {
  addBlocker(`City data readiness for ${cityDataIssues.city}: ${issue}`);
}
for (const issue of cityDataIssues.warnings) {
  addWarning(`City data readiness for ${cityDataIssues.city}: ${issue}`);
}

const deviceQaIssues = collectDeviceQaEvidenceIssues();
for (const issue of deviceQaIssues.blockers) {
  addBlocker(`Device QA evidence: ${issue}`);
}
for (const issue of deviceQaIssues.warnings) {
  addWarning(`Device QA evidence: ${issue}`);
}

const devtoolsIssues = collectDevtoolsPreconditionIssues();
for (const issue of devtoolsIssues.blockers) {
  addBlocker(`Device QA precondition: ${issue}`);
}
for (const issue of devtoolsIssues.warnings) {
  addWarning(`Device QA precondition: ${issue}`);
}

if (benchmarkMeta.status !== 'not_generated') {
  addWarning(`benchmark status is ${benchmarkMeta.status}; verify competition features stay gated`);
}

if (blockers.length > 0 || warnings.length > 0) {
  if (blockers.length > 0) {
    console.error(`Release blockers:\n${blockers.map((item) => `- ${item}`).join('\n')}`);
  }
  if (warnings.length > 0) {
    console.error(`Release warnings:\n${warnings.map((item) => `- ${item}`).join('\n')}`);
  }
  const nextActions = buildReleaseNextActions({
    assetIssues,
    cityDataIssues,
    dataBackfillSummary,
    devtoolsIssues,
    deviceQaIssues,
    supportFileIssues,
    worktreeIssues
  });
  printReleaseNextActions(nextActions);
  process.exit(blockers.length > 0 ? 1 : 0);
}

console.log('OK release readiness gates pass');
