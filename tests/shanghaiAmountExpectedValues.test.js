const test = require('node:test');
const assert = require('node:assert/strict');

const expectedValues = require('../data/generated/shanghai-amount-expected-values.json');
const { calculatePensionEstimate } = require('../miniprogram/utils/pensionCalculator');

test('Shanghai amount expected values enumerate every generated Shanghai calculation case', () => {
  assert.equal(expectedValues.city, 'shanghai');
  assert.equal(expectedValues.caseCount, 482);
  assert.equal(expectedValues.cases.length, expectedValues.caseCount);
});

test('Shanghai amount expected values match current calculator output', () => {
  for (const item of expectedValues.cases) {
    const result = calculatePensionEstimate(item.inputs);
    assert.deepEqual(result.amount, item.expected.amount, `${item.caseId} amount`);
    assert.deepEqual(result.breakdown, item.expected.breakdown, `${item.caseId} breakdown`);
    assert.deepEqual(result.contribution, item.expected.contribution, `${item.caseId} contribution`);
    assert.deepEqual(result.eligibility, item.expected.eligibility, `${item.caseId} eligibility`);
  }
});
