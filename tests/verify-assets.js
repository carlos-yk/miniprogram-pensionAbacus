const { collectReleaseAssetIssues } = require('./lib/releaseAssets');

const { missing, untracked, modified, invalid } = collectReleaseAssetIssues();

function printNextSteps() {
  const filesToAdd = Array.from(new Set([...untracked, ...modified]));

  console.error('Release asset next steps:');
  console.error('- Keep release assets listed in miniprogram/assets/release-assets.json.');
  console.error('- Confirm every required asset exists, matches dimensions, stays under maxBytes, and is referenced by usedBy pages.');
  if (filesToAdd.length > 0) {
    console.error(`- Track required release assets with: git add ${filesToAdd.join(' ')}`);
  }
  console.error('- Re-run npm run verify:assets after staging/tracking assets.');
}

if (missing.length > 0 || untracked.length > 0 || modified.length > 0 || invalid.length > 0) {
  if (missing.length > 0) {
    console.error(`Missing assets:\n${missing.join('\n')}`);
  }
  if (untracked.length > 0) {
    console.error(`Untracked release assets:\n${untracked.join('\n')}`);
  }
  if (modified.length > 0) {
    console.error(`Modified release assets not staged/committed:\n${modified.join('\n')}`);
  }
  if (invalid.length > 0) {
    console.error(`Invalid release assets:\n${invalid.join('\n')}`);
  }
  printNextSteps();
  process.exit(1);
}

console.log('OK release assets match manifest and are tracked');
