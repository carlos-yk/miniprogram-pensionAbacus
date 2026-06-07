const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const privateQaPaths = [
  'qa/device-qa-evidence.json',
  'qa/artifacts/ios-main-flow.png',
  'qa/artifacts/android-main-flow.png'
];
const trackableReleaseAssetPaths = [
  'miniprogram/assets/release-assets.json',
  'miniprogram/assets/logo-pension-abacus.png'
];

function isGitIgnored(relativePath) {
  try {
    execFileSync('git', ['check-ignore', '-q', '--', relativePath], {
      cwd: root,
      stdio: 'ignore'
    });
    return true;
  } catch (error) {
    return false;
  }
}

const blockers = [];
const passed = [];

for (const relativePath of privateQaPaths) {
  if (isGitIgnored(relativePath)) {
    passed.push(`${relativePath} is ignored`);
  } else {
    blockers.push(`${relativePath} must be ignored so local device QA evidence is not committed`);
  }
}

for (const relativePath of trackableReleaseAssetPaths) {
  if (isGitIgnored(relativePath)) {
    blockers.push(`${relativePath} must be trackable; do not ignore release assets`);
  } else {
    passed.push(`${relativePath} is trackable`);
  }
}

if (blockers.length > 0) {
  console.error(`QA privacy blockers:\n${blockers.map((item) => `- ${item}`).join('\n')}`);
  console.error('Update .gitignore so QA evidence stays local and required release assets remain trackable.');
  process.exit(1);
}

console.log('OK QA evidence privacy and release asset git hygiene');
for (const item of passed) {
  console.log(`- ${item}`);
}
