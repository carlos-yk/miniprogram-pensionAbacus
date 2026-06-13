const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  collectDevtoolsPreconditionIssues,
  defaultDevtoolsCliPath,
  root
} = require('./lib/devtoolsPreconditions');

function printPreviewCommand() {
  console.log(`Preview command:\n${preconditions.previewCommand}`);
}

const cliPath = defaultDevtoolsCliPath;
const preconditions = collectDevtoolsPreconditionIssues({ cliPath });
let activePreviewArgs = preconditions.previewArgs;

function getPreviewOutput(flagName) {
  const index = activePreviewArgs.indexOf(flagName);
  return index >= 0 ? activePreviewArgs[index + 1] : null;
}

function replacePreviewArg(args, flagName, replacement) {
  const index = args.indexOf(flagName);
  if (index < 0) return args;
  const nextArgs = args.slice();
  nextArgs[index + 1] = replacement;
  return nextArgs;
}

function createPreviewArtifactPlan() {
  const plan = [];

  for (const flagName of ['--qr-output', '--info-output']) {
    const index = preconditions.previewArgs.indexOf(flagName);
    const outputPath = index >= 0 ? preconditions.previewArgs[index + 1] : null;
    if (!outputPath) continue;
    const tempPath = `${outputPath}.${process.pid}.tmp`;
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.rmSync(tempPath, { force: true });
    plan.push({ flagName, outputPath, tempPath });
  }

  return plan;
}

function buildPreviewArgsForPlan(plan) {
  let args = preconditions.previewArgs;
  for (const item of plan) {
    args = replacePreviewArg(args, item.flagName, item.tempPath);
  }
  return args;
}

function promotePreviewArtifacts(plan) {
  const missingArtifacts = plan
    .filter((item) => !fs.existsSync(item.tempPath))
    .map((item) => item.outputPath);

  if (missingArtifacts.length > 0) {
    throw new Error(`WeChat DevTools preview artifacts missing:\n${missingArtifacts.join('\n')}`);
  }

  for (const item of plan) {
    fs.renameSync(item.tempPath, item.outputPath);
  }
}

function assertPreviewArtifacts() {
  const qrOutput = getPreviewOutput('--qr-output');
  const infoOutput = getPreviewOutput('--info-output');
  const missingArtifacts = [qrOutput, infoOutput].filter((filePath) => !filePath || !fs.existsSync(filePath));

  if (missingArtifacts.length > 0) {
    console.error(`WeChat DevTools preview artifacts missing:\n${missingArtifacts.join('\n')}`);
    console.error('Make sure DevTools is logged in, IDE service port is enabled, and preview completed successfully.');
    printPreviewCommand();
    process.exit(1);
  }
}

if (preconditions.blockers.length > 0) {
  console.error(preconditions.blockers.join('\n'));
  console.error('Set WECHAT_DEVTOOLS_CLI to the CLI executable path and rerun this check.');
  process.exit(1);
}

if (process.argv.includes('--preview')) {
  const artifactPlan = createPreviewArtifactPlan();

  try {
    activePreviewArgs = buildPreviewArgsForPlan(artifactPlan);
    execFileSync(cliPath, activePreviewArgs, {
      cwd: root,
      stdio: 'inherit'
    });
    promotePreviewArtifacts(artifactPlan);
    activePreviewArgs = preconditions.previewArgs;
    assertPreviewArtifacts();
    console.log('OK WeChat DevTools preview completed');
  } catch (error) {
    activePreviewArgs = preconditions.previewArgs;
    for (const item of artifactPlan) {
      fs.rmSync(item.tempPath, { force: true });
    }
    if (error && error.message && error.message.includes('preview artifacts missing')) {
      console.error(error.message);
    }
    console.error('WeChat DevTools preview failed. Make sure DevTools is logged in and local automation can listen on localhost.');
    printPreviewCommand();
    process.exit(1);
  }
} else {
  console.log(`OK WeChat DevTools CLI is available: ${cliPath}`);
  printPreviewCommand();
  console.log('Run with --preview on a non-sandboxed, logged-in desktop to generate the QR code for device testing.');
}
