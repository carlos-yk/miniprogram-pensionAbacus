const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..', '..');
const manifestPath = 'miniprogram/assets/release-assets.json';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
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

function readFileSize(relativePath) {
  return fs.statSync(path.join(root, relativePath)).size;
}

function readPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== pngSignature) {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function getReleaseAssetManifest() {
  return readJson(manifestPath);
}

function getRequiredReleaseAssets() {
  const manifest = getReleaseAssetManifest();
  return (manifest.assets || []).filter((asset) => asset.required);
}

function getExpectedPackagePath(assetPath) {
  const prefix = 'miniprogram';
  if (!String(assetPath).startsWith(`${prefix}/`)) return null;
  return `/${String(assetPath).slice(prefix.length + 1)}`;
}

function collectReleaseAssetManifestMetadataIssues(manifest, currentManifestPath = manifestPath) {
  const invalid = [];
  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
  const seenPaths = new Set();

  if (manifest.schemaVersion !== '1.0') {
    invalid.push(`${currentManifestPath}: unsupported schemaVersion ${manifest.schemaVersion || 'missing'}`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(manifest.lastUpdated || ''))) {
    invalid.push(`${currentManifestPath}: lastUpdated must use YYYY-MM-DD`);
  }

  if (!Array.isArray(manifest.assets)) {
    invalid.push(`${currentManifestPath}: assets must be an array`);
    return invalid;
  }

  if (assets.length === 0) {
    invalid.push(`${currentManifestPath}: assets must not be empty`);
  }

  for (const asset of assets) {
    if (!asset.path) {
      invalid.push(`${currentManifestPath}: asset path is required`);
      continue;
    }

    if (seenPaths.has(asset.path)) {
      invalid.push(`${currentManifestPath}: duplicate asset path ${asset.path}`);
    }
    seenPaths.add(asset.path);

    if (!String(asset.path).startsWith('miniprogram/assets/')) {
      invalid.push(`${asset.path}: asset path must stay under miniprogram/assets/`);
    }

    if (!asset.purpose || String(asset.purpose).trim().length === 0) {
      invalid.push(`${asset.path}: purpose is required`);
    }

    if (asset.required !== true && asset.required !== false) {
      invalid.push(`${asset.path}: required must be boolean`);
    }

    if (asset.packagePath && !String(asset.packagePath).startsWith('/assets/')) {
      invalid.push(`${asset.path}: packagePath must start with /assets/`);
    }

    const expectedPackagePath = asset.packagePath ? getExpectedPackagePath(asset.path) : null;
    if (expectedPackagePath && asset.packagePath !== expectedPackagePath) {
      invalid.push(`${asset.path}: packagePath must match asset path ${expectedPackagePath}`);
    }

    if (asset.maxBytes !== undefined && (!Number.isInteger(asset.maxBytes) || asset.maxBytes <= 0)) {
      invalid.push(`${asset.path}: maxBytes must be a positive integer`);
    }

    if (asset.dimensions) {
      if (
        !Number.isInteger(asset.dimensions.width) ||
        !Number.isInteger(asset.dimensions.height) ||
        asset.dimensions.width <= 0 ||
        asset.dimensions.height <= 0
      ) {
        invalid.push(`${asset.path}: dimensions width and height must be positive integers`);
      }
    }

    if (asset.usedBy !== undefined && !Array.isArray(asset.usedBy)) {
      invalid.push(`${asset.path}: usedBy must be an array`);
    }
  }

  return invalid;
}

function collectReleaseAssetIssues({
  manifest: providedManifest,
  fileExists: exists = fileExists,
  isGitTracked: checkGitTracked = isGitTracked,
  isGitModified: checkGitModified = isGitModified,
  readFileSize: getFileSize = readFileSize,
  readPngDimensions: getPngDimensions = readPngDimensions
} = {}) {
  const missing = [];
  const untracked = [];
  const modified = [];
  const invalid = [];
  const hasProvidedManifest = providedManifest !== undefined;

  if (!hasProvidedManifest && !exists(manifestPath)) {
    missing.push(manifestPath);
    return { missing, untracked, modified, invalid };
  }

  if (!hasProvidedManifest && !checkGitTracked(manifestPath)) {
    untracked.push(manifestPath);
  } else if (!hasProvidedManifest && checkGitModified(manifestPath)) {
    modified.push(manifestPath);
  }

  const manifest = hasProvidedManifest ? providedManifest : getReleaseAssetManifest();
  const assets = Array.isArray(manifest.assets) ? manifest.assets : [];
  invalid.push(...collectReleaseAssetManifestMetadataIssues(manifest));

  for (const asset of assets) {
    if (!asset.path) {
      continue;
    }

    const absoluteAssetPath = path.join(root, asset.path);
    if (!exists(asset.path)) {
      missing.push(asset.path);
      continue;
    }

    if (!checkGitTracked(asset.path)) {
      untracked.push(asset.path);
    } else if (checkGitModified(asset.path)) {
      modified.push(asset.path);
    }

    if (asset.maxBytes && getFileSize(asset.path) > asset.maxBytes) {
      invalid.push(`${asset.path}: exceeds maxBytes ${asset.maxBytes}`);
    }

    if (asset.dimensions && asset.path.endsWith('.png')) {
      const dimensions = getPngDimensions(absoluteAssetPath);
      if (!dimensions) {
        invalid.push(`${asset.path}: expected a PNG asset`);
      } else if (
        dimensions.width !== asset.dimensions.width ||
        dimensions.height !== asset.dimensions.height
      ) {
        invalid.push(
          `${asset.path}: expected ${asset.dimensions.width}x${asset.dimensions.height}, got ${dimensions.width}x${dimensions.height}`
        );
      }
    }

    const usedBy = asset.usedBy || [];
    if (asset.packagePath && usedBy.length === 0) {
      invalid.push(`${asset.path}: usedBy is required when packagePath is set`);
    }

    for (const usedByPath of usedBy) {
      const absoluteUsedByPath = path.join(root, usedByPath);
      if (!fs.existsSync(absoluteUsedByPath)) {
        invalid.push(`${asset.path}: usedBy file missing ${usedByPath}`);
        continue;
      }

      const content = fs.readFileSync(absoluteUsedByPath, 'utf8');
      if (asset.packagePath && !content.includes(asset.packagePath)) {
        invalid.push(`${asset.path}: ${usedByPath} does not reference ${asset.packagePath}`);
      }
    }
  }

  return { missing, untracked, modified, invalid };
}

module.exports = {
  collectReleaseAssetManifestMetadataIssues,
  collectReleaseAssetIssues,
  getRequiredReleaseAssets,
  manifestPath
};
