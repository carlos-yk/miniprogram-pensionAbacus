const fs = require('node:fs');
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

function getPreviewOutput(flagName) {
  const index = preconditions.previewArgs.indexOf(flagName);
  return index >= 0 ? preconditions.previewArgs[index + 1] : null;
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
  try {
    execFileSync(cliPath, preconditions.previewArgs, {
      cwd: root,
      stdio: 'inherit'
    });
    assertPreviewArtifacts();
    console.log('OK WeChat DevTools preview completed');
  } catch (error) {
    console.error('WeChat DevTools preview failed. Make sure DevTools is logged in and local automation can listen on localhost.');
    printPreviewCommand();
    process.exit(1);
  }
} else {
  console.log(`OK WeChat DevTools CLI is available: ${cliPath}`);
  printPreviewCommand();
  console.log('Run with --preview on a non-sandboxed, logged-in desktop to generate the QR code for device testing.');
}
