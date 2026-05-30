const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getCityGateOptions,
  canSubmitCity,
  getBenchmarkGate,
  getDisabledCitySubmitLabel,
  evaluateCityGate,
  getCityGateOption
} = require('../miniprogram/utils/dataGate');

test('city gate blocks partial or pending city data from public calculation', () => {
  const options = getCityGateOptions();

  assert.deepEqual(
    options.map((option) => ({
      city: option.city,
      status: option.status,
      canSubmit: option.canSubmit
    })),
    [
      { city: 'shanghai', status: 'data_reviewing', canSubmit: false },
      { city: 'beijing', status: 'data_reviewing', canSubmit: false },
      { city: 'shenzhen', status: 'history_backfilling', canSubmit: false }
    ]
  );

  assert.equal(canSubmitCity('shanghai'), false);
  assert.equal(canSubmitCity('beijing'), false);
  assert.equal(canSubmitCity('shenzhen'), false);
});

test('ready city still blocks public calculation when historical coverage is incomplete', () => {
  const gate = evaluateCityGate({
    city: 'demo',
    name: '演示城市',
    rawStatus: 'ready',
    coverage: {
      officialCompleteYears: [2025],
      partialYears: [],
      missingYears: [2015, 2016]
    }
  });

  assert.equal(gate.status, 'history_backfilling');
  assert.equal(gate.label, '暂未开放');
  assert.equal(gate.canSubmit, false);
  assert.match(gate.message, /暂未开放/);
});

test('submit label says unavailable when every city is blocked', () => {
  assert.equal(getDisabledCitySubmitLabel(), '暂未开放测算');
});

test('internal preview keeps public gate closed while allowing preview estimate copy', () => {
  const shanghai = getCityGateOption('shanghai', { internalPreview: true });

  assert.equal(canSubmitCity('shanghai'), false);
  assert.equal(shanghai.canSubmit, false);
  assert.equal(shanghai.canPreview, true);
  assert.equal(shanghai.previewLabel, '可试算');
  assert.match(shanghai.previewMessage, /仅供参考/);
  assert.doesNotMatch(shanghai.previewMessage, /流程/);
  assert.equal(getDisabledCitySubmitLabel({ internalPreview: true }), '开始试算');
});

test('benchmark gate hides competition features when benchmark is not generated', () => {
  const gate = getBenchmarkGate();

  assert.equal(gate.enabled, false);
  assert.equal(gate.showCompetitionScore, false);
  assert.equal(gate.showPercentile, false);
  assert.equal(gate.showTrophy, false);
  assert.equal(gate.showCompetitionShareCard, false);
});
