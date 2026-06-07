const features = require('../miniprogram/config/features');
const { benchmarkMeta } = require('../miniprogram/data/runtime-data');
const { getCityGateOptions } = require('../miniprogram/utils/dataGate');
const { collectCityDataReadinessIssues, defaultReleaseCity } = require('./lib/cityDataReadiness');
const { collectDataBackfillTaskSummary } = require('./lib/dataBackfillTasks');
const { collectDevtoolsPreconditionIssues } = require('./lib/devtoolsPreconditions');
const { collectDeviceQaEvidenceIssues } = require('./lib/deviceQaEvidence');
const { buildReleaseNextActions, printReleaseNextActions } = require('./lib/releaseNextActions');
const { collectReleaseAssetIssues } = require('./lib/releaseAssets');
const { collectReleaseSupportFileIssues } = require('./lib/releaseSupportFiles');
const { collectReleaseWorktreeIssues } = require('./lib/releaseWorktree');

const outputJson = process.argv.includes('--json');

function createSection(title, items) {
  const checks = items.filter(Boolean).map((item) => ({
    status: item.status,
    message: item.message
  }));

  const blockers = checks.filter((item) => item.status === 'blocker').map((item) => item.message);
  const warnings = checks.filter((item) => item.status === 'warning').map((item) => item.message);
  const passed = checks.filter((item) => item.status === 'pass').map((item) => item.message);

  return { title, status: blockers.length > 0 ? 'BLOCKED' : (warnings.length > 0 ? 'WARN' : 'PASS'), checks, blockers, warnings, passed };
}

function printSection(section) {
  console.log(`\n${section.title}`);
  if (section.passed.length > 0) {
    for (const item of section.passed) {
      console.log(`  PASS ${item}`);
    }
  }
  if (section.warnings.length > 0) {
    for (const item of section.warnings) {
      console.log(`  WARN ${item}`);
    }
  }
  if (section.blockers.length > 0) {
    for (const item of section.blockers) {
      console.log(`  BLOCKED ${item}`);
    }
  }
}

const assetIssues = collectReleaseAssetIssues();
const supportFileIssues = collectReleaseSupportFileIssues();
const worktreeIssues = collectReleaseWorktreeIssues();
const cityDataIssues = collectCityDataReadinessIssues(defaultReleaseCity);
const dataBackfillSummary = collectDataBackfillTaskSummary({
  city: defaultReleaseCity,
  priority: 'P0',
  limit: 6
});
const devtoolsIssues = collectDevtoolsPreconditionIssues();
const deviceQaIssues = collectDeviceQaEvidenceIssues();
const publicCityOptions = getCityGateOptions();
const openCities = publicCityOptions.filter((city) => city.canSubmit);

const sections = [
  createSection('Feature Flags', [
    features.releaseProfile === 'public'
      ? { status: 'pass', message: 'releaseProfile is public' }
      : { status: 'blocker', message: `releaseProfile is ${features.releaseProfile}` },
    features.internalPreviewEnabled === false
      ? { status: 'pass', message: 'internalPreviewEnabled is false' }
      : { status: 'blocker', message: 'internalPreviewEnabled must be false for public release' },
    features.monetizationEnabled === false
      ? { status: 'pass', message: 'monetizationEnabled is false' }
      : { status: 'blocker', message: 'monetizationEnabled must remain false for V1 release' },
    features.competitionEnabled === false
      ? { status: 'pass', message: 'competitionEnabled is false' }
      : { status: 'blocker', message: 'competitionEnabled must remain false for V1 release' }
  ]),
  createSection('Release Assets', [
    ...assetIssues.missing.map((item) => ({ status: 'blocker', message: `missing ${item}` })),
    ...assetIssues.untracked.map((item) => ({ status: 'blocker', message: `not tracked by git: ${item}` })),
    ...assetIssues.modified.map((item) => ({ status: 'blocker', message: `has local changes not staged/committed: ${item}` })),
    ...assetIssues.invalid.map((item) => ({ status: 'blocker', message: item })),
    assetIssues.missing.length === 0 && assetIssues.untracked.length === 0 && assetIssues.modified.length === 0 && assetIssues.invalid.length === 0
      ? { status: 'pass', message: 'assets match manifest and are tracked' }
      : null
  ].filter(Boolean)),
  createSection('Release Support Files', [
    ...supportFileIssues.missing.map((item) => ({ status: 'blocker', message: `missing ${item}` })),
    ...supportFileIssues.untracked.map((item) => ({ status: 'blocker', message: `not tracked by git: ${item}` })),
    ...supportFileIssues.modified.map((item) => ({ status: 'blocker', message: `has local changes not staged/committed: ${item}` })),
    supportFileIssues.missing.length === 0 && supportFileIssues.untracked.length === 0 && supportFileIssues.modified.length === 0
      ? { status: 'pass', message: 'release support files are tracked and clean' }
      : null
  ].filter(Boolean)),
  createSection('Release Worktree', [
    ...worktreeIssues.modified.map((item) => ({ status: 'blocker', message: `has local changes not staged/committed: ${item}` })),
    ...worktreeIssues.untracked.map((item) => ({ status: 'blocker', message: `untracked release file: ${item}` })),
    worktreeIssues.modified.length === 0 && worktreeIssues.untracked.length === 0
      ? { status: 'pass', message: 'release worktree is clean' }
      : null
  ].filter(Boolean)),
  createSection('City Gate', [
    openCities.length > 0
      ? { status: 'pass', message: `public calculation open cities: ${openCities.map((city) => city.name).join(', ')}` }
      : { status: 'blocker', message: 'no city is open for public calculation' }
  ]),
  createSection('Shanghai Data', [
    ...cityDataIssues.blockers.map((item) => ({ status: 'blocker', message: item })),
    ...cityDataIssues.warnings.map((item) => ({ status: 'warning', message: item })),
    cityDataIssues.blockers.length === 0
      ? { status: 'pass', message: 'city data readiness gates pass' }
      : null
  ].filter(Boolean)),
  createSection('Data Backfill Tasks', [
    dataBackfillSummary.totalTasks > 0
      ? {
        status: 'warning',
        message: `${dataBackfillSummary.priority} tasks for ${dataBackfillSummary.city}: ${dataBackfillSummary.totalTasks}`
      }
      : { status: 'pass', message: `no ${dataBackfillSummary.priority} data backfill tasks for ${dataBackfillSummary.city}` },
    ...Object.entries(dataBackfillSummary.byType).map(([type, count]) => ({
      status: 'warning',
      message: `${type}: ${count}`
    })),
    ...dataBackfillSummary.visibleTasks.map((task) => ({
      status: 'warning',
      message: `${task.id} - ${task.title}`
    })),
    dataBackfillSummary.remainingHiddenTasks > 0
      ? { status: 'warning', message: `${dataBackfillSummary.remainingHiddenTasks} more tasks in ${dataBackfillSummary.reportPath}` }
      : null
  ].filter(Boolean)),
  createSection('Benchmark And Competition', [
    features.competitionEnabled === false
      ? { status: 'pass', message: 'competition hard-off is enabled for V1' }
      : { status: 'blocker', message: 'competition hard-off is disabled' },
    benchmarkMeta.status === 'not_generated'
      ? { status: 'pass', message: 'benchmark is not generated; competition UI remains gated' }
      : { status: 'warning', message: `benchmark status is ${benchmarkMeta.status}; verify competition UI remains gated` }
  ]),
  createSection('Device QA Preconditions', [
    ...devtoolsIssues.passed.map((item) => ({ status: 'pass', message: item })),
    ...devtoolsIssues.warnings.map((item) => ({ status: 'warning', message: item })),
    ...devtoolsIssues.blockers.map((item) => ({ status: 'blocker', message: item }))
  ]),
  createSection('Device QA Evidence', [
    ...deviceQaIssues.blockers.map((item) => ({ status: 'blocker', message: item })),
    ...deviceQaIssues.warnings.map((item) => ({ status: 'warning', message: item })),
    deviceQaIssues.blockers.length === 0
      ? { status: 'pass', message: `device QA evidence passes: ${deviceQaIssues.evidencePath}` }
      : null
  ])
];

const blockerCount = sections.reduce((sum, section) => sum + section.blockers.length, 0);
const warningCount = sections.reduce((sum, section) => sum + section.warnings.length, 0);
const conclusion = blockerCount > 0 ? 'BLOCKED' : (warningCount > 0 ? 'PASS_WITH_CONCERNS' : 'PASS');
const nextActions = buildReleaseNextActions({
  assetIssues,
  cityDataIssues,
  dataBackfillSummary,
  devtoolsIssues,
  deviceQaIssues,
  supportFileIssues,
  worktreeIssues
});
const report = {
  conclusion,
  releaseCity: defaultReleaseCity,
  blockerCount,
  warningCount,
  generatedAt: new Date().toISOString(),
  sections,
  nextActions
};

if (outputJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Conclusion: ${report.conclusion}`);
  console.log(`Release city: ${report.releaseCity}`);
  console.log(`Blockers: ${report.blockerCount}`);
  console.log(`Warnings: ${report.warningCount}`);

  for (const section of report.sections) {
    printSection(section);
  }
  if (report.nextActions.length > 0) {
    console.log('');
    printReleaseNextActions(report.nextActions, console.log);
  }
}
