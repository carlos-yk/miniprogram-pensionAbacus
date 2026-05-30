const test = require('node:test');
const assert = require('node:assert/strict');

const cityHistoryParams = require('../data/official/city-history-params.json');

const expectedShanghaiParams = [
  [2015, 5451, 3271, 16353],
  [2016, 5939, 3563, 17817],
  [2017, 6504, 3902, 19512],
  [2018, 7132, 4279, 21396],
  [2019, 8211, 4927, 24633],
  [2020, 9339, 4927, 28017],
  [2021, 10338, 5975, 31014],
  [2022, 11396, 6520, 34188],
  [2023, 12183, 7310, 36549],
  [2024, 12307, 7384, 36921],
  [2025, 12434, 7460, 37302]
];

test('Shanghai official history params cover 2015-2025 key pension inputs', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  assert.ok(shanghai);

  for (const [year, averageWage, floor, ceiling] of expectedShanghaiParams) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);
    assert.ok(row, `missing Shanghai ${year}`);
    assert.equal(row.averageWage.value, averageWage, `averageWage ${year}`);
    assert.equal(row.pensionCalculationBase.value, averageWage, `pensionCalculationBase ${year}`);
    assert.equal(row.contributionBase.employee.floor, floor, `employee floor ${year}`);
    assert.equal(row.contributionBase.employee.ceiling, ceiling, `employee ceiling ${year}`);
    assert.equal(row.contributionBase.flexible.floor, floor, `flexible floor ${year}`);
    assert.equal(row.contributionBase.flexible.ceiling, ceiling, `flexible ceiling ${year}`);
    assert.equal(row.rates.employeePersonalRate, 0.08, `employee personal rate ${year}`);
    assert.equal(row.rates.personalAccountCreditRate, 0.08, `personal account rate ${year}`);
  }
});
