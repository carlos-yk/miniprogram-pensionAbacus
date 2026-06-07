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
