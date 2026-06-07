const test = require('node:test');
const assert = require('node:assert/strict');

const {
  collectReleaseAssetIssues,
  collectReleaseAssetManifestMetadataIssues
} = require('./lib/releaseAssets');

test('release asset verifier reports untracked assets without depending on worktree state', () => {
  const issues = collectReleaseAssetIssues({
    manifest: {
      schemaVersion: '1.0',
      lastUpdated: '2026-06-05',
      assets: [
        {
          path: 'miniprogram/assets/logo-pension-abacus.png',
          purpose: 'logo',
          required: true
        }
      ]
    },
    fileExists: () => true,
    isGitTracked: () => false,
    isGitModified: () => false,
    readFileSize: () => 100
  });

  assert.deepEqual(issues.untracked, ['miniprogram/assets/logo-pension-abacus.png']);
  assert.deepEqual(issues.modified, []);
});

test('release asset manifest metadata validator catches incomplete assets', () => {
  const invalid = collectReleaseAssetManifestMetadataIssues({
    schemaVersion: '1.0',
    lastUpdated: '20260603',
    assets: [
      {
        path: 'logo.png',
        packagePath: 'assets/logo.png',
        required: 'yes',
        maxBytes: -1,
        dimensions: { width: 0, height: '1254' },
        usedBy: 'miniprogram/pages/home/home.wxml'
      },
      {
        path: 'logo.png',
        purpose: 'duplicate'
      },
      {
        path: 'miniprogram/assets/brand.png',
        packagePath: '/assets/wrong-brand.png',
        purpose: 'brand logo',
        required: true
      }
    ]
  });

  assert.ok(invalid.some((item) => item.includes('lastUpdated must use YYYY-MM-DD')));
  assert.ok(invalid.some((item) => item.includes('asset path must stay under miniprogram/assets/')));
  assert.ok(invalid.some((item) => item.includes('purpose is required')));
  assert.ok(invalid.some((item) => item.includes('required must be boolean')));
  assert.ok(invalid.some((item) => item.includes('packagePath must start with /assets/')));
  assert.ok(invalid.some((item) => item.includes('maxBytes must be a positive integer')));
  assert.ok(invalid.some((item) => item.includes('dimensions width and height must be positive integers')));
  assert.ok(invalid.some((item) => item.includes('usedBy must be an array')));
  assert.ok(invalid.some((item) => item.includes('duplicate asset path logo.png')));
  assert.ok(invalid.some((item) => item.includes('packagePath must match asset path')));
});

test('release asset verifier reports tracked assets with local modifications', () => {
  const issues = collectReleaseAssetIssues({
    manifest: {
      schemaVersion: '1.0',
      lastUpdated: '2026-06-05',
      assets: [
        {
          path: 'miniprogram/assets/logo-pension-abacus.png',
          purpose: 'logo',
          required: true
        }
      ]
    },
    fileExists: () => true,
    isGitTracked: () => true,
    isGitModified: (file) => file === 'miniprogram/assets/logo-pension-abacus.png',
    readFileSize: () => 100
  });

  assert.deepEqual(issues.modified, ['miniprogram/assets/logo-pension-abacus.png']);
});
