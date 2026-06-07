const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');

const releaseWorktreePaths = [
  '.gitignore',
  'package.json',
  'project.config.json',
  'data',
  'docs',
  'miniprogram',
  'qa/device-qa-evidence.example.json',
  'tests'
];

const localEvidencePrefixes = [
  'qa/device-qa-evidence.json',
  'qa/artifacts/'
];

function getStatusOutput(paths = releaseWorktreePaths) {
  return execFileSync('git', ['status', '--porcelain', '--untracked-files=all', '--', ...paths], {
    cwd: root,
    encoding: 'utf8'
  });
}

function normalizeStatusPath(rawPath) {
  const normalized = rawPath.trim().replace(/\\/g, '/');
  if (normalized.includes(' -> ')) {
    return normalized.split(' -> ').pop();
  }
  return normalized;
}

function isLocalEvidencePath(relativePath) {
  return localEvidencePrefixes.some((prefix) =>
    relativePath === prefix || relativePath.startsWith(prefix)
  );
}

function collectReleaseWorktreeIssues({
  getStatusOutput: readStatusOutput = () => getStatusOutput()
} = {}) {
  const modified = [];
  const untracked = [];

  const output = String(readStatusOutput() || '');
  for (const line of output.split(/\r?\n/)) {
    if (!line.trim()) continue;

    const status = line.slice(0, 2);
    const file = normalizeStatusPath(line.slice(3));
    if (!file || isLocalEvidencePath(file)) {
      continue;
    }

    if (status === '??') {
      untracked.push(file);
    } else {
      modified.push(file);
    }
  }

  return { modified, untracked };
}

module.exports = {
  collectReleaseWorktreeIssues,
  releaseWorktreePaths
};
