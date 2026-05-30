const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getAdvancedContributionOptions,
  getContributionOptions,
  getPrimaryContributionOptions,
  getWorkerTypes
} = require('../miniprogram/utils/formOptions');

test('worker type options are ordered for a two-column retirement type layout', () => {
  const options = getWorkerTypes();

  assert.deepEqual(
    options.map((option) => option.key),
    ['female_original_55', 'female_original_50', 'male', 'female_unknown']
  );
  assert.equal(options.find((option) => option.key === 'female_unknown').label, '不确定，帮我算');
});

test('contribution options include all documented social average wage ratios', () => {
  const options = getContributionOptions();
  const ratioKeys = options
    .filter((option) => option.input && option.input.type === 'ratio')
    .map((option) => option.key);

  assert.deepEqual(ratioKeys, ['ratio_60', 'ratio_100', 'ratio_150', 'ratio_300']);
  assert.equal(options.find((option) => option.key === 'ratio_150').input.contributionIndex, 1.5);
});

test('contribution options default to simple choices before advanced ratios', () => {
  assert.deepEqual(
    getPrimaryContributionOptions().map((option) => option.key),
    ['floor', 'salary', 'base']
  );
  assert.deepEqual(
    getAdvancedContributionOptions().map((option) => option.key),
    ['ratio_60', 'ratio_100', 'ratio_150', 'ratio_300']
  );
});
