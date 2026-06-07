const test = require('node:test');
const assert = require('node:assert/strict');

const {
  calculatePensionEstimate,
  buildDefaultSharePayload,
  _getPersonalAccountCreditRateForMonth,
  _getYearParamForMonth
} = require('../miniprogram/utils/pensionCalculator');

test('returns V1 estimate shape with account supplement status and warnings', () => {
  const result = calculatePensionEstimate({
    city: 'shanghai',
    workerType: 'male',
    birthMonth: '1968-06',
    paidMonths: 360,
    contributionInput: { type: 'ratio', contributionIndex: 1 },
    personalAccount: { known: true, balance: 180000 }
  });

  assert.equal(result.cityName, '上海');
  assert.equal(result.statusLabel, '账户余额已补充');
  assert.equal(result.breakdown.transitionPension.included, false);
  assert.equal(result.competition.visible, false);
  assert.equal(result.eligibility.eligible, true);
  assert.ok(result.amount.monthlyTotal > 0);
  assert.ok(result.amount.rangeLow < result.amount.monthlyTotal);
  assert.ok(result.amount.rangeHigh > result.amount.monthlyTotal);
  assert.ok(result.warnings.some((warning) => warning.includes('过渡性养老金')));
});

test('unknown female retirement type returns a combined range rather than a single retirement age', () => {
  const result = calculatePensionEstimate({
    city: 'shanghai',
    workerType: 'female_unknown',
    birthMonth: '1978-06',
    paidMonths: 360,
    contributionInput: { type: 'ratio', contributionIndex: 1 },
    personalAccount: { known: false, balance: null }
  });

  assert.equal(result.statusLabel, '快速估算');
  assert.equal(result.retirement.isRange, true);
  assert.equal(result.retirement.tracks.length, 2);
  assert.ok(result.assumptions.some((item) => item.includes('退休类型可能影响')));
  assert.ok(result.amount.rangeLow < result.amount.rangeHigh);
});

test('default share payload does not include sensitive amount or input details', () => {
  const result = calculatePensionEstimate({
    city: 'shanghai',
    workerType: 'male',
    birthMonth: '1968-06',
    paidMonths: 360,
    contributionInput: { type: 'ratio', contributionIndex: 1 },
    personalAccount: { known: true, balance: 180000 }
  });
  const share = buildDefaultSharePayload(result);

  assert.equal(share.title, '退休金算盘｜少填也能算，细填更准确');
  assert.equal(share.path, '/pages/home/home');
  assert.doesNotMatch(JSON.stringify(share), /5200|180000|1968|360|缴费年限|个人账户/);
});

test('result exposes user-facing data quality text for pending city data', () => {
  const result = calculatePensionEstimate({
    city: 'beijing',
    workerType: 'male',
    birthMonth: '1968-06',
    paidMonths: 360,
    contributionInput: { type: 'ratio', contributionIndex: 1 },
    personalAccount: { known: false, balance: null },
    mode: 'internal_preview'
  });

  assert.equal(result.releaseMode, 'internal_preview');
  assert.equal(result.dataQuality.reviewStatus, 'pending_second_review');
  assert.match(result.dataQuality.reviewStatusText, /暂未开放/);
  assert.equal(result.dataQuality.missingFieldLabels.includes('个人账户记账利率'), true);
  assert.equal(result.dataQuality.missingFieldLabels.includes('平均工资口径'), true);
  assert.equal(result.warnings.some((warning) => warning.includes('内部预览')), false);
  assert.ok(result.warnings.some((warning) => warning.includes('暂未开放测算')));
  assert.equal(result.warnings.some((warning) => /普通测算|内部|预览/.test(warning)), false);
  assert.ok(result.assumptions.some((item) => item.includes('历史缴费')));
  assert.equal(result.warnings.some((warning) => warning.includes('不可对外使用')), false);
});

test('Shanghai estimates use available yearly params for historical paid months', () => {
  const result = calculatePensionEstimate({
    city: 'shanghai',
    workerType: 'male',
    birthMonth: '1965-05',
    paidMonths: 132,
    contributionInput: { type: 'ratio', contributionIndex: 1 },
    personalAccount: { known: false, balance: null },
    currentMonth: '2026-05'
  });
  const currentOnlyAccount = 12434 * 0.08 * 132;
  const currentOnlyAccountPension = Math.round(currentOnlyAccount / result.retirement.payoutMonths);

  assert.ok(
    result.breakdown.personalAccountPension < currentOnlyAccountPension,
    'historical account estimate should not silently use 2025 params for every paid month'
  );
  assert.ok(result.assumptions.some((item) => item.includes('分段估算')));
});

test('Shanghai historical params are selected by effective month instead of calendar year', () => {
  assert.equal(_getYearParamForMonth('shanghai', '2025-06').year, 2024);
  assert.equal(_getYearParamForMonth('shanghai', '2025-07').year, 2025);
  assert.equal(_getYearParamForMonth('shanghai', '2009-03').year, 2008);
  assert.equal(_getYearParamForMonth('shanghai', '2009-04').year, 2009);
});

test('Shanghai personal account credit rate follows 2006 transition month segments', () => {
  assert.equal(_getYearParamForMonth('shanghai', '2005-12').year, 2005);
  assert.equal(_getYearParamForMonth('shanghai', '2006-01').year, 2005);
  assert.equal(_getPersonalAccountCreditRateForMonth('shanghai', '2005-12'), 0.11);
  assert.equal(_getPersonalAccountCreditRateForMonth('shanghai', '2006-01'), 0.08);
  assert.equal(_getPersonalAccountCreditRateForMonth('shanghai', '2006-04'), 0.08);
});
