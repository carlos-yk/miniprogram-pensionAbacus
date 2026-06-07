const {
  collectDeviceQaEvidenceIssues,
  getLatestWatchedFileChange,
  requiredCheckLabels,
  requiredChecks,
  requiredPlatforms
} = require('./lib/deviceQaEvidence');

const { evidencePath, examplePath, blockers, warnings } = collectDeviceQaEvidenceIssues();

function printNextSteps() {
  const latestChange = getLatestWatchedFileChange();

  console.error('Device QA next steps:');
  console.error('- Run npm run verify:devtools to confirm the CLI path.');
  console.error('- Run npm run qa:device-evidence:init to create a conservative evidence draft.');
  console.error('- Run npm run verify:devtools:preview on a non-sandboxed, logged-in WeChat DevTools desktop.');
  console.error(`- Use ${examplePath} as the template and fill ${evidencePath} after real device QA.`);
  console.error('- The preview QR and info files must exist at devtools.qrOutput and devtools.infoOutput.');
  console.error('- The iOS and Android device screenshots must exist at each device.screenshot path.');
  console.error(`- Required platforms: ${requiredPlatforms.join(', ')}`);
  if (latestChange) {
    console.error(`- testedAt must be later than ${latestChange.path} (${latestChange.mtimeIso}).`);
  }
  console.error('- Required checks:');
  for (const check of requiredChecks) {
    console.error(`  - ${requiredCheckLabels[check] || check}`);
  }
}

if (blockers.length > 0 || warnings.length > 0) {
  if (blockers.length > 0) {
    console.error(`Device QA evidence blockers:\n${blockers.map((item) => `- ${item}`).join('\n')}`);
  }
  if (warnings.length > 0) {
    console.error(`Device QA evidence warnings:\n${warnings.map((item) => `- ${item}`).join('\n')}`);
  }
  printNextSteps();
  process.exit(blockers.length > 0 ? 1 : 0);
}

console.log(`OK device QA evidence passes: ${evidencePath}`);
