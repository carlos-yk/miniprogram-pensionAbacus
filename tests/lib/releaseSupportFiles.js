const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');

const fixedRequiredReleaseSupportFiles = [
  '.gitignore',
  'package.json',
  'docs/README.md',
  'docs/16-release-readiness-and-device-qa.md',
  'qa/device-qa-evidence.example.json',
  'data/generated/city-data-backfill-tasks.json',
  'data/generated/generate-city-data-backfill-tasks.mjs',
  'tests/devtools-login.js',
  'tests/init-device-qa-evidence.js',
  'tests/print-release-status.js',
  'tests/verify-assets.js',
  'tests/verify-city-data-readiness.js',
  'tests/verify-data-sync.js',
  'tests/verify-device-qa.js',
  'tests/verify-devtools-cli.js',
  'tests/verify-qa-privacy.js',
  'tests/verify-release-readiness.js',
  'tests/dataBackfillTasks.test.js',
  'tests/verifyAssets.test.js',
  'tests/verifyCityDataReadiness.test.js',
  'tests/verifyDeviceQa.test.js',
  'tests/verifyDevtoolsCli.test.js',
  'tests/verifyReleaseReadiness.test.js'
];

function listJsFiles(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];

  return fs.readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => path.join(relativeDir, entry.name).replace(/\\/g, '/'))
    .sort();
}

function isGitTracked(relativePath) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', relativePath], {
      cwd: root,
      stdio: 'ignore'
    });
    return true;
  } catch (error) {
    return false;
  }
}

function isGitModified(relativePath) {
  try {
    const output = execFileSync('git', ['status', '--porcelain', '--', relativePath], {
      cwd: root,
      encoding: 'utf8'
    });
    return output.trim().length > 0;
  } catch (error) {
    return false;
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function getRequiredReleaseSupportFiles() {
  return Array.from(new Set([
    ...fixedRequiredReleaseSupportFiles,
    ...listJsFiles('tests/lib')
  ])).sort();
}

function collectReleaseSupportFileIssues({
  requiredFiles = getRequiredReleaseSupportFiles(),
  fileExists: exists = fileExists,
  isGitTracked: checkGitTracked = isGitTracked,
  isGitModified: checkGitModified = isGitModified
} = {}) {
  const missing = [];
  const untracked = [];
  const modified = [];

  for (const file of requiredFiles) {
    if (!exists(file)) {
      missing.push(file);
      continue;
    }

    if (!checkGitTracked(file)) {
      untracked.push(file);
    } else if (checkGitModified(file)) {
      modified.push(file);
    }
  }

  return { missing, untracked, modified };
}

module.exports = {
  collectReleaseSupportFileIssues,
  getRequiredReleaseSupportFiles
};
