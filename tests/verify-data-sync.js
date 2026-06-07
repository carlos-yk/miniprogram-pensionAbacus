const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const runtimeData = require('../miniprogram/data/runtime-data');

const copiedJsonPairs = [
  ['data/official/city-params.json', 'miniprogram/data/city-params.json'],
  ['data/official/city-history-params.json', 'miniprogram/data/city-history-params.json'],
  ['data/official/city-history-coverage.json', 'miniprogram/data/city-history-coverage.json'],
  ['data/official/payout-months.json', 'miniprogram/data/payout-months.json'],
  ['data/official/pension-policy.json', 'miniprogram/data/pension-policy.json'],
  ['data/official/retirement-age-rules.json', 'miniprogram/data/retirement-age-rules.json'],
  ['data/generated/benchmark-meta.json', 'miniprogram/data/benchmark-meta.json']
];

const runtimeMappings = [
  ['cityParams', 'data/official/city-params.json'],
  ['cityHistoryParams', 'data/official/city-history-params.json'],
  ['cityHistoryCoverage', 'data/official/city-history-coverage.json'],
  ['pensionPolicy', 'data/official/pension-policy.json'],
  ['retirementRules', 'data/official/retirement-age-rules.json'],
  ['payoutMonths', 'data/official/payout-months.json'],
  ['benchmarkMeta', 'data/generated/benchmark-meta.json']
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

for (const [source, target] of copiedJsonPairs) {
  assert.equal(read(target), read(source), `${target} is not synchronized with ${source}`);
}

for (const [runtimeKey, source] of runtimeMappings) {
  assert.deepEqual(runtimeData[runtimeKey], readJson(source), `runtime-data.${runtimeKey} is not synchronized with ${source}`);
}

console.log('OK miniprogram data is synchronized with source data');
