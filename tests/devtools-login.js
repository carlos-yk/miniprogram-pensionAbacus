const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const {
  defaultDevtoolsCliPath,
  getLoginArgs,
  root
} = require('./lib/devtoolsPreconditions');

function getLoginOutput(flagName) {
  const loginArgs = getLoginArgs();
  const index = loginArgs.indexOf(flagName);
  return index >= 0 ? loginArgs[index + 1] : null;
}

function ensureOutputDirectories() {
  for (const flagName of ['--qr-output', '--result-output']) {
    const outputPath = getLoginOutput(flagName);
    if (!outputPath) continue;
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
}

const cliPath = defaultDevtoolsCliPath;
const qrOutput = getLoginOutput('--qr-output');
const resultOutput = getLoginOutput('--result-output');

if (!fs.existsSync(cliPath)) {
  console.error(`WeChat DevTools CLI missing: ${cliPath}`);
  process.exit(1);
}

try {
  ensureOutputDirectories();
  execFileSync(cliPath, getLoginArgs(), {
    cwd: root,
    stdio: 'inherit'
  });

  const missingArtifacts = [qrOutput, resultOutput].filter((filePath) => !filePath || !fs.existsSync(filePath));
  if (missingArtifacts.length > 0) {
    console.error(`WeChat DevTools login artifacts missing:\n${missingArtifacts.join('\n')}`);
    process.exit(1);
  }

  console.log('OK WeChat DevTools login QR generated');
  console.log(`QR output: ${qrOutput}`);
  console.log(`Result output: ${resultOutput}`);
  console.log('Scan the QR code with WeChat, then rerun npm run verify:devtools:preview.');
} catch (error) {
  console.error('WeChat DevTools login failed. Make sure DevTools can start and local automation can listen on localhost.');
  process.exit(1);
}
