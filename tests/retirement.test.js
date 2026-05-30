const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateRetirement, getRequiredContributionMonths } = require('../miniprogram/utils/retirement');
const retirementRules = require('../data/official/retirement-age-rules.json');

test('matches encoded national retirement sample cases', () => {
  for (const sample of retirementRules.verificationSamples) {
    const result = calculateRetirement(sample.workerType, sample.birthMonth);

    assert.equal(result.delayMonths, sample.expectedDelayMonths, sample.caseId);
    assert.equal(result.retirementMonth, sample.expectedRetirementMonth, sample.caseId);
    assert.equal(result.retirementAgeText, sample.expectedRetirementAge, sample.caseId);
  }
});

test('uses gradual minimum contribution months by retirement year', () => {
  assert.equal(getRequiredContributionMonths(2029), 180);
  assert.equal(getRequiredContributionMonths(2030), 186);
  assert.equal(getRequiredContributionMonths(2035), 216);
  assert.equal(getRequiredContributionMonths(2039), 240);
  assert.equal(getRequiredContributionMonths(2045), 240);
});
