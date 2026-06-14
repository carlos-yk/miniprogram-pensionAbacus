const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getCityGateOptions,
  canSubmitCity,
  canUseCachedEstimate,
  getBenchmarkGate,
  getDisabledCitySubmitLabel,
  evaluateCityGate,
  getCityGateOption,
  getPaidHistoryRisk,
  getUnsupportedPaidHistoryYears
} = require('../miniprogram/utils/dataGate');
const { benchmarkMeta } = require('../miniprogram/data/runtime-data');

test('city gate opens reviewed launch city while keeping later cities unavailable', () => {
  const options = getCityGateOptions();

  assert.deepEqual(
    options.map((option) => ({
      city: option.city,
      status: option.status,
      canSubmit: option.canSubmit
    })),
    [
      { city: 'shanghai', status: 'ready', canSubmit: true },
      { city: 'beijing', status: 'data_reviewing', canSubmit: false },
      { city: 'shenzhen', status: 'history_backfilling', canSubmit: false }
    ]
  );

  assert.equal(canSubmitCity('shanghai'), true);
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

test('submit label uses the normal action when a reviewed city is open', () => {
  assert.equal(getDisabledCitySubmitLabel(), '立即测算');
});

test('city gate copy avoids internal public-versus-preview wording', () => {
  const options = getCityGateOptions();

  for (const option of options) {
    assert.doesNotMatch(option.message, /普通测算|内部|预览/);
  }
});

test('internal preview does not downgrade public cities and still allows scoped blocked-city previews', () => {
  const previewOptions = { internalPreview: true, previewCities: ['shanghai'] };
  const shanghai = getCityGateOption('shanghai', previewOptions);
  const previewGate = evaluateCityGate({
    city: 'demo',
    name: '演示城市',
    rawStatus: 'partial_pending_second_review',
    coverage: {
      officialCompleteYears: [],
      partialYears: [2025],
      missingYears: []
    },
    internalPreview: true,
    previewCities: ['demo']
  });
  const beijing = getCityGateOption('beijing', previewOptions);

  assert.equal(canSubmitCity('shanghai'), true);
  assert.equal(shanghai.canSubmit, true);
  assert.equal(shanghai.canPreview, false);
  assert.equal(previewGate.canSubmit, false);
  assert.equal(previewGate.canPreview, true);
  assert.equal(previewGate.previewLabel, '可试算');
  assert.match(previewGate.previewMessage, /仅供参考/);
  assert.doesNotMatch(previewGate.previewMessage, /流程/);
  assert.equal(beijing.canSubmit, false);
  assert.equal(beijing.canPreview, false);
  assert.equal(getDisabledCitySubmitLabel(previewOptions), '立即测算');
});

test('paid history support blocks only inputs that touch unreviewed Shanghai years', () => {
  assert.deepEqual(
    getUnsupportedPaidHistoryYears({
      city: 'shanghai',
      paidMonths: 10 * 12,
      currentMonth: '2026-05'
    }),
    []
  );

  assert.deepEqual(
    getUnsupportedPaidHistoryYears({
      city: 'shanghai',
      paidMonths: 15 * 12,
      currentMonth: '2026-05'
    }),
    [2013]
  );
});

test('paid history risk allows non-core missing years while keeping them visible', () => {
  const risk = getPaidHistoryRisk({
    city: 'shanghai',
    paidMonths: 15 * 12,
    currentMonth: '2026-05'
  });

  assert.equal(risk.hasRisk, true);
  assert.equal(risk.blocking, false);
  assert.deepEqual(risk.softYears, [2013]);
  assert.deepEqual(risk.blockingYears, []);
  assert.match(risk.message, /2013/);
});

test('paid history risk still blocks years with core historical parameter gaps', () => {
  const risk = getPaidHistoryRisk({
    city: 'shanghai',
    paidMonths: 30 * 12,
    currentMonth: '2026-05'
  });

  assert.equal(risk.hasRisk, true);
  assert.equal(risk.blocking, true);
  assert.deepEqual(risk.blockingYears, [2000, 2001, 2002, 2003, 2004, 2005]);
  assert.deepEqual(risk.softYears, [2006, 2007, 2013]);
});

test('cached estimates must pass the current city gate before reuse', () => {
  assert.equal(
    canUseCachedEstimate({
      city: 'shanghai',
      releaseMode: 'public',
      contribution: { paidMonths: 15 * 12 }
    }),
    true
  );

  assert.equal(
    canUseCachedEstimate({
      city: 'shanghai',
      releaseMode: 'public',
      contribution: { paidMonths: 10 * 12 }
    }),
    true
  );

  assert.equal(
    canUseCachedEstimate(
      { city: 'shanghai', releaseMode: 'internal_preview' },
      { internalPreview: true, previewCities: ['shanghai'] }
    ),
    true
  );

  assert.equal(
    canUseCachedEstimate(
      { city: 'beijing', releaseMode: 'internal_preview' },
      { internalPreview: true, previewCities: ['shanghai'] }
    ),
    false
  );
});

test('benchmark gate hides competition features when benchmark is not generated', () => {
  const gate = getBenchmarkGate();

  assert.equal(gate.enabled, false);
  assert.equal(gate.showCompetitionScore, false);
  assert.equal(gate.showPercentile, false);
  assert.equal(gate.showTrophy, false);
  assert.equal(gate.showCompetitionShareCard, false);
});

test('competition features stay hard-off for V1 even when benchmark data is ready', () => {
  const readyBenchmark = {
    benchmarkVersion: 'shanghai-2026-reviewed',
    status: 'generated_reviewed',
    sampleFileReady: true,
    cityParamsReviewed: true,
    amountSamplesVerified: true,
    reverseChecksPassed: true,
    reason: ''
  };
  const gate = getBenchmarkGate(readyBenchmark, { competitionEnabled: false });

  assert.equal(gate.enabled, false);
  assert.equal(gate.showCompetitionScore, false);
  assert.equal(gate.showPercentile, false);
  assert.equal(gate.showTrophy, false);
  assert.equal(gate.showCompetitionShareCard, false);
  assert.match(gate.reason, /暂未开放/);
});

test('benchmark gate does not expose raw internal or English metadata reason', () => {
  const pendingBenchmark = {
    benchmarkVersion: null,
    status: 'not_generated',
    sampleFileReady: false,
    cityParamsReviewed: false,
    amountSamplesVerified: false,
    reverseChecksPassed: false,
    reason: 'official city history params are incomplete; generate benchmark samples later'
  };
  const gate = getBenchmarkGate(pendingBenchmark, { competitionEnabled: true });

  assert.equal(gate.enabled, false);
  assert.equal(gate.reason, '基准样本暂未开放');
  assert.doesNotMatch(gate.reason, /official|benchmark|params|incomplete/i);
});

test('bundled benchmark metadata keeps pending generation notes user-facing', () => {
  assert.match(benchmarkMeta.reason, /基准样本|城市历史参数|暂未生成/);
  assert.doesNotMatch(
    benchmarkMeta.reason,
    /official|city history|params|benchmark|samples|backfilled|reviewed|generate/i
  );

  for (const item of benchmarkMeta.requiredBeforeGeneration) {
    assert.match(item, /[\u4e00-\u9fa5]/);
    assert.doesNotMatch(
      item,
      /city-history-params|pension-policy|payout-months|sample generation/i
    );
  }
});
