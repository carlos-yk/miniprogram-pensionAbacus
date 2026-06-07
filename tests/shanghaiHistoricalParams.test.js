const test = require('node:test');
const assert = require('node:assert/strict');

const cityHistoryParams = require('../data/official/city-history-params.json');
const sourceCatalog = require('../data/official/sources.json');

const expectedShanghaiParams = [
  [2000, 1179, 707, 3537, 0.07, 0.11],
  [2001, 1285, 771, 3855, 0.07, 0.11],
  [2002, 1480, 888, 4440, 0.07, 0.11],
  [2003, 1623, 974, 4869, 0.08, 0.11],
  [2004, 1847, 1108, 5541, 0.08, 0.11],
  [2005, 2033, 1220, 6099, 0.08, 0.11],
  [2006, 2235, 1341, 6705],
  [2007, 2464, 1478, 7392],
  [2008, 2892, 1735, 8676],
  [2009, 3292, 1975, 9876],
  [2010, 3566, 2140, 10698],
  [2011, 3896, 2338, 11688],
  [2012, 4331, 2599, 12993],
  [2013, 4692, 2815, 14076],
  [2014, 5036, 3022, 15108],
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

const expectedShanghaiAccountInterestRates = [
  [2004, 0.0198],
  [2008, 0.0414],
  [2009, 0.0225],
  [2010, 0.0225],
  [2012, 0.035],
  [2014, 0.0425],
  [2015, 0.0275],
  [2016, 0.0831],
  [2017, 0.0712],
  [2018, 0.0829],
  [2019, 0.0761],
  [2020, 0.0604],
  [2021, 0.0669],
  [2022, 0.0612],
  [2023, 0.0397],
  [2024, 0.0262],
  [2025, 0.015]
];

const productionReadyAccountInterestSources = [
  'national-account-interest-rate-2016',
  'national-account-interest-rate-2017',
  'national-account-interest-rate-2018',
  'national-account-interest-rate-2019',
  'national-account-interest-rate-2020',
  'national-account-interest-rate-2021',
  'national-account-interest-rate-2022',
  'national-account-interest-rate-2023',
  'national-account-interest-rate-2024',
  'national-account-interest-rate-2025'
];

const productionReadyOfficialPolicySources = [
  'national-enterprise-pension-system-2005',
  'national-social-insurance-rate-2019',
  'shanghai-pension-account-rule-1998-official',
  'shanghai-pension-calculation-method-2025',
  'shanghai-contribution-base-2020',
  'shanghai-contribution-base-2021',
  'shanghai-average-wage-2021',
  'shanghai-social-insurance-standard-2016',
  'shanghai-social-insurance-base-2017-hrss-report',
  'shanghai-social-insurance-standard-2018',
  'shanghai-social-insurance-base-2019',
  'shanghai-social-insurance-base-2022-official-wechat-repost',
  'shanghai-social-insurance-base-2023',
  'shanghai-contribution-base-2024',
  'shanghai-social-insurance-base-2025'
];

const productionReadyOfficialHistoricalSources = [
  'shanghai-social-insurance-base-2004-public-notice',
  'shanghai-average-wage-2006',
  'shanghai-average-wage-2007',
  'shanghai-average-wage-2008',
  'shanghai-average-wage-2009',
  'shanghai-average-wage-2010',
  'shanghai-average-wage-2011',
  'shanghai-average-wage-2012',
  'shanghai-social-insurance-standard-2010',
  'shanghai-social-insurance-standard-2011',
  'shanghai-social-insurance-standard-2012',
  'shanghai-social-insurance-standard-2013'
];

const correctedHistoricalSourceUrls = {
  'shanghai-average-wage-2011': 'https://rsj.sh.gov.cn/tzrsxhfz_17793/20200617/t0035_1389344.html',
  'shanghai-social-insurance-standard-2010': 'https://rsj.sh.gov.cn/tqtwj_17340/20200617/t0035_1389013.html',
  'shanghai-social-insurance-standard-2011': 'https://rsj.sh.gov.cn/tqtwj_17340/20200617/t0035_1389009.html',
  'shanghai-social-insurance-standard-2012': 'https://rsj.sh.gov.cn/tqtwj_17340/20200617/t0035_1389010.html'
};

test('Shanghai official history params cover 2000-2025 key pension inputs', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  assert.ok(shanghai);

  for (const [year, averageWage, floor, ceiling, employeeRate = 0.08, accountCreditRate = 0.08] of expectedShanghaiParams) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);
    assert.ok(row, `missing Shanghai ${year}`);
    assert.equal(row.averageWage.value, averageWage, `averageWage ${year}`);
    assert.equal(row.pensionCalculationBase.value, averageWage, `pensionCalculationBase ${year}`);
    assert.equal(row.contributionBase.employee.floor, floor, `employee floor ${year}`);
    assert.equal(row.contributionBase.employee.ceiling, ceiling, `employee ceiling ${year}`);
    assert.equal(row.contributionBase.flexible.floor, floor, `flexible floor ${year}`);
    assert.equal(row.contributionBase.flexible.ceiling, ceiling, `flexible ceiling ${year}`);
    assert.equal(row.rates.employeePersonalRate, employeeRate, `employee personal rate ${year}`);
    assert.equal(row.rates.personalAccountCreditRate, accountCreditRate, `personal account rate ${year}`);
  }
});

test('Shanghai official history params include sourced account interest rates for 2015-2025', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  assert.ok(shanghai);

  for (const [year, rate] of expectedShanghaiAccountInterestRates) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);
    assert.ok(row, `missing Shanghai ${year}`);
    assert.equal(row.accountInterestRate.value, rate, `accountInterestRate ${year}`);
    assert.match(row.accountInterestRate.sourceIds[0], /account-interest-rate-/);
    assert.notEqual(row.dataQuality.missingFields.includes('accountInterestRate'), true);
  }
});

test('official account interest rate sources for 2017-2025 are production ready', () => {
  for (const sourceId of productionReadyAccountInterestSources) {
    const source = sourceCatalog.sources.find((item) => item.sourceId === sourceId);
    assert.ok(source, `missing source ${sourceId}`);
    assert.equal(source.review.status, 'production_ready', `review status ${sourceId}`);
    assert.ok(source.review.reviewedBy, `reviewedBy ${sourceId}`);
    assert.ok(source.review.reviewedAt, `reviewedAt ${sourceId}`);
  }
});

test('Shanghai 2012 account interest rate source is production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2012);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-account-interest-rate-2012');

  assert.ok(row, 'missing Shanghai 2012');
  assert.ok(source, 'missing Shanghai 2012 account interest source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.accountInterestRate, 0.035);
  assert.deepEqual(row.accountInterestRate.sourceIds, ['shanghai-account-interest-rate-2012']);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), false);
});

test('Shanghai 2011 account interest rate source is cross-checked and production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2011);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-account-interest-rate-2011-rights-record-report');

  assert.ok(row, 'missing Shanghai 2011');
  assert.ok(source, 'missing Shanghai 2011 account interest source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.accountInterestRate, 0.0275);
  assert.equal(source.extractedValues.accountInterestRatePercent, '2.75%');
  assert.deepEqual(row.accountInterestRate.sourceIds, ['shanghai-account-interest-rate-2011-rights-record-report']);
  assert.equal(row.accountInterestRate.value, 0.0275);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), false);
});

test('Shanghai 2011 April-June contribution base gap is resolved by public report and official standard', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2011);
  const aprilSource = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-standard-2011-april-public-report');
  const julySource = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-standard-2011');

  assert.ok(row, 'missing Shanghai 2011');
  assert.ok(aprilSource, 'missing Shanghai 2011 April social insurance standard source');
  assert.ok(julySource, 'missing Shanghai 2011 official social insurance standard source');
  assert.equal(aprilSource.review.status, 'production_ready');
  assert.equal(aprilSource.effectiveFrom, '2011-04-01');
  assert.equal(aprilSource.effectiveTo, '2011-06-30');
  assert.equal(aprilSource.extractedValues.contributionBaseFloor, 2338);
  assert.equal(aprilSource.extractedValues.contributionBaseCeiling, 11688);
  assert.equal(aprilSource.extractedValues.employerRate, 0.22);
  assert.equal(aprilSource.extractedValues.employeePersonalRate, 0.08);
  assert.equal(julySource.review.status, 'production_ready');
  assert.equal(row.effectiveFrom, '2011-04-01');
  assert.equal(row.effectiveTo, '2012-03-31');
  assert.deepEqual(row.contributionBase.employee.sourceIds, [
    'shanghai-social-insurance-standard-2011-april-public-report',
    'shanghai-social-insurance-standard-2011'
  ]);
  assert.deepEqual(row.contributionBase.flexible.sourceIds, [
    'shanghai-social-insurance-standard-2011-april-public-report',
    'shanghai-social-insurance-standard-2011'
  ]);
  assert.deepEqual(row.contributionBase.employeeSegments, [
    {
      effectiveFrom: '2011-04-01',
      effectiveTo: '2011-06-30',
      floor: 2338,
      ceiling: 11688,
      sourceIds: ['shanghai-social-insurance-standard-2011-april-public-report'],
      quality: 'public_report_cross_checked_with_official_wage_production_ready'
    },
    {
      effectiveFrom: '2011-07-01',
      effectiveTo: '2012-03-31',
      floor: 2338,
      ceiling: 11688,
      sourceIds: ['shanghai-social-insurance-standard-2011'],
      quality: 'official_local_standard_production_ready'
    }
  ]);
  assert.deepEqual(row.contributionBase.flexibleSegments, row.contributionBase.employeeSegments);
  assert.equal(row.dataQuality.missingFields.includes('2011-04-01至2011-06-30缴费基数口径'), false);
  assert.equal(row.dataQuality.reviewStatus, 'production_ready');
});

test('Shanghai 2010 account interest rate source is production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2010);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-account-interest-rate-2010');

  assert.ok(row, 'missing Shanghai 2010');
  assert.ok(source, 'missing Shanghai 2010 account interest source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.accountInterestRate, 0.0225);
  assert.match(source.url, /zc\.51shebao\.com/);
  assert.deepEqual(row.accountInterestRate.sourceIds, ['shanghai-account-interest-rate-2010']);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), false);
});

test('Shanghai 2009 account interest rate source is production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2009);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-account-interest-rate-2009');

  assert.ok(row, 'missing Shanghai 2009');
  assert.ok(source, 'missing Shanghai 2009 account interest source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.accountInterestRate, 0.0225);
  assert.match(source.url, /zc\.51shebao\.com/);
  assert.deepEqual(row.accountInterestRate.sourceIds, ['shanghai-account-interest-rate-2009']);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), false);
  assert.equal(row.dataQuality.reviewStatus, 'production_ready');
});

test('Shanghai 2008 account interest rate source is production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2008);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-account-interest-rate-2008');

  assert.ok(row, 'missing Shanghai 2008');
  assert.ok(source, 'missing Shanghai 2008 account interest source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.accountInterestRate, 0.0414);
  assert.match(source.url, /110\.com/);
  assert.deepEqual(row.accountInterestRate.sourceIds, ['shanghai-account-interest-rate-2008']);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), false);
  assert.equal(row.dataQuality.reviewStatus, 'production_ready');
});

test('Shanghai 2004 account interest rate source is production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2004);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-account-interest-rate-2004');

  assert.ok(row, 'missing Shanghai 2004');
  assert.ok(source, 'missing Shanghai 2004 account interest source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.accountInterestRate, 0.0198);
  assert.match(source.url, /zc\.51shebao\.com/);
  assert.deepEqual(row.accountInterestRate.sourceIds, ['shanghai-account-interest-rate-2004']);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), false);
  assert.equal(row.dataQuality.reviewStatus, 'pending_review');
});

test('Shanghai 2015 account interest rate source is production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2015);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-account-interest-rate-2015');

  assert.ok(row, 'missing Shanghai 2015');
  assert.ok(source, 'missing Shanghai 2015 account interest source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.documentNo, '沪人社基发〔2015〕1号');
  assert.equal(source.publishedAt, '2015-01-05');
  assert.equal(source.extractedValues.accountInterestRate, 0.0275);
  assert.match(source.url, /law\.esnai\.com/);
  assert.deepEqual(row.accountInterestRate.sourceIds, ['shanghai-account-interest-rate-2015']);
  assert.doesNotMatch(row.accountInterestRate.quality, /pending|candidate/i);
});

test('Shanghai 2014 account interest rate source is cross-checked and production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2014);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-account-interest-rate-2014-public-report');

  assert.ok(row, 'missing Shanghai 2014');
  assert.ok(source, 'missing Shanghai 2014 account interest source');
  assert.equal(source.review.status, 'production_ready');
  assert.ok(source.review.reviewedBy, 'reviewedBy');
  assert.ok(source.review.reviewedAt, 'reviewedAt');
  assert.equal(source.documentNo, '沪人社基发〔2014〕1号');
  assert.equal(source.extractedValues.accountInterestRate, 0.0425);
  assert.deepEqual(row.accountInterestRate.sourceIds, ['shanghai-account-interest-rate-2014-public-report']);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), false);
  assert.equal(row.accountInterestRate.quality, 'public_report_cross_checked_production_ready_pending_original_notice');
});

test('Shanghai 2003 and 2004 pension rate adjustment sources are production ready', () => {
  const cases = [
    [
      'shanghai-pension-rate-adjustment-2003-policy-repost',
      '沪劳保养发〔2003〕36号',
      '2003-08-18',
      'https://zc.51shebao.com/detail/814564',
      {
        employeePersonalRateBefore20030801: 0.07,
        employeePersonalRateFrom20030801: 0.08,
        unitAccountCreditRateFrom20030801: 0.03
      }
    ],
    [
      'shanghai-pension-rate-adjustment-2004-policy-repost',
      '沪府办发〔2004〕45号',
      '2004-07-29',
      'https://www.shanghai.gov.cn/nw12942/20200815/0001-12942_1897.html',
      {
        employerRateBefore20040801: 0.225,
        employerRateFrom20040801: 0.22
      }
    ]
  ];

  for (const [sourceId, documentNo, publishedAt, url, expectedValues] of cases) {
    const source = sourceCatalog.sources.find((item) => item.sourceId === sourceId);
    assert.ok(source, `missing source ${sourceId}`);
    assert.equal(source.documentNo, documentNo);
    assert.equal(source.publishedAt, publishedAt);
    assert.equal(source.url, url);
    assert.equal(source.review.status, 'production_ready');
    assert.ok(source.review.reviewedBy, `reviewedBy ${sourceId}`);
    assert.ok(source.review.reviewedAt, `reviewedAt ${sourceId}`);
    for (const [key, value] of Object.entries(expectedValues)) {
      assert.equal(source.extractedValues[key], value, `${sourceId} ${key}`);
    }
  }
});

test('Shanghai 2004 employer rate segment uses official municipal source', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2004);

  assert.ok(row, 'missing Shanghai 2004');
  assert.equal(row.dataQuality.missingFields.includes('养老保险费率原始官方页面URL'), false);
  assert.equal(
    row.dataQuality.missingFields.includes('2004-08-01至2005-03-31养老保险单位缴费比例口径'),
    false
  );
  assert.deepEqual(row.rates.employerRateSegments, [
    {
      effectiveFrom: '2004-04-01',
      effectiveTo: '2004-07-31',
      employerRate: 0.225,
      sourceIds: ['shanghai-pension-rate-adjustment-2004-policy-repost'],
      quality: 'official_municipal_policy_production_ready'
    },
    {
      effectiveFrom: '2004-08-01',
      effectiveTo: '2005-03-31',
      employerRate: 0.22,
      sourceIds: ['shanghai-pension-rate-adjustment-2004-policy-repost'],
      quality: 'official_municipal_policy_production_ready'
    }
  ]);
});

test('Shanghai 1999-2003 average wage repost sources are production ready', () => {
  const cases = [
    [
      'shanghai-average-wage-1999-regulation-repost',
      'https://www.laodongfa.com/stadata/dfzf/84.html',
      '沪劳保综发〔2000〕19号、沪财企一〔2000〕79号',
      '2000-03-27',
      14147,
      1179
    ],
    [
      'shanghai-average-wage-2000-regulation-repost',
      'https://www.laodongfa.com/stadata/dfzf/85.html',
      '沪劳保综发〔2001〕17号',
      '2001-01-01',
      15420,
      1285
    ],
    [
      'shanghai-average-wage-2001-regulation-repost',
      'https://www.laodongfa.com/hot/6873.html',
      '沪劳保综发〔2002〕13号',
      '2002-03-19',
      17764,
      1480
    ],
    [
      'shanghai-average-wage-2002-regulation-repost',
      'https://www.laodongfa.com/hot/6874.html',
      '沪劳保综发〔2003〕8号',
      '2003-03-25',
      19473,
      1623
    ],
    [
      'shanghai-average-wage-2003-regulation-repost',
      'https://www.laodongfa.com/stadata/dfzf/3052.html',
      '沪劳保综发〔2004〕12号',
      '2004-03-26',
      22160,
      1847
    ]
  ];

  for (const [sourceId, url, documentNo, publishedAt, annualWage, monthlyWage] of cases) {
    const source = sourceCatalog.sources.find((item) => item.sourceId === sourceId);
    assert.ok(source, `missing source ${sourceId}`);
    assert.equal(source.url, url);
    assert.equal(source.documentNo, documentNo);
    assert.equal(source.publishedAt, publishedAt);
    assert.equal(source.extractedValues.averageWageAnnual, annualWage);
    assert.equal(source.extractedValues.averageWage, monthlyWage);
    assert.equal(source.review.status, 'production_ready');
    assert.ok(source.review.reviewedBy, `reviewedBy ${sourceId}`);
    assert.ok(source.review.reviewedAt, `reviewedAt ${sourceId}`);
  }
});

test('Shanghai 2000 official employer rate adjustment source and segments are production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2000);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-employer-rate-adjustment-2000-official');

  assert.ok(row, 'missing Shanghai 2000');
  assert.ok(source, 'missing Shanghai 2000 employer rate source');
  assert.equal(source.url, 'https://rsj.sh.gov.cn/txgszfgz_17262/20200617/t0035_1388490.html');
  assert.equal(source.publisher, '上海市人力资源和社会保障局');
  assert.equal(source.documentNo, '沪府办发〔2000〕114号');
  assert.equal(source.publishedAt, '2000-11-10');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.employerRateBefore20001201, 0.255);
  assert.equal(source.extractedValues.employerRateFrom20001201, 0.225);
  assert.equal(
    row.dataQuality.missingFields.includes('2000-04-01至2000-11-30养老保险单位缴费比例分段口径'),
    false
  );
  assert.equal(row.dataQuality.missingFields.includes('养老保险费率原始官方页面URL'), false);
  assert.deepEqual(row.rates.employerRateSegments, [
    {
      effectiveFrom: '2000-04-01',
      effectiveTo: '2000-11-30',
      employerRate: 0.255,
      sourceIds: ['shanghai-employer-rate-adjustment-2000-official'],
      quality: 'official_municipal_notice_production_ready'
    },
    {
      effectiveFrom: '2000-12-01',
      effectiveTo: '2001-03-31',
      employerRate: 0.225,
      sourceIds: ['shanghai-employer-rate-adjustment-2000-official'],
      quality: 'official_municipal_notice_production_ready'
    }
  ]);
});

test('Shanghai 2000 personal account credit rate uses official 1998 account rule source', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2000);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-pension-account-rule-1998-official');

  assert.ok(row, 'missing Shanghai 2000');
  assert.ok(source, 'missing Shanghai 1998 pension account source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.personalAccountCreditRateFrom19980401, 0.11);
  assert.equal(row.rates.personalAccountCreditRate, 0.11);
  assert.ok(row.rates.sourceIds.includes('shanghai-pension-account-rule-1998-official'));
  assert.equal(row.dataQuality.missingFields.includes('2000年度养老保险个人账户划入比例口径'), false);
});

test('Shanghai 2001 and 2002 personal account credit rates reuse official 1998 account rule source', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-pension-account-rule-1998-official');

  assert.ok(source, 'missing Shanghai 1998 pension account source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.effectiveFrom, '1998-01-01');
  assert.equal(source.effectiveTo, null);
  assert.equal(source.extractedValues.personalAccountCreditRateFrom19980401, 0.11);

  for (const year of [2001, 2002]) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);
    assert.ok(row, `missing Shanghai ${year}`);
    assert.equal(row.rates.personalAccountCreditRate, 0.11);
    assert.ok(row.rates.sourceIds.includes('shanghai-pension-account-rule-1998-official'));
    assert.ok(source.fields.includes(`city-history-params.shanghai.${year}.rates.personalAccountCreditRate`));
    assert.equal(row.dataQuality.missingFields.includes(`${year}年度养老保险个人账户划入比例口径`), false);
  }
});

test('Shanghai 2004 average wage regulation repost source is production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2005);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-average-wage-2004-regulation-repost');

  assert.ok(row, 'missing Shanghai 2005');
  assert.ok(source, 'missing Shanghai 2004 average wage source');
  assert.equal(source.url, 'https://www.110.com/fagui/law_224832.html');
  assert.equal(source.documentNo, '沪劳保综发〔2005〕10号');
  assert.equal(source.publishedAt, '2005-03-21');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.averageWageAnnual, 24398);
  assert.equal(source.extractedValues.averageWage, 2033);
  assert.deepEqual(row.averageWage.sourceIds, ['shanghai-average-wage-2004-regulation-repost']);
  assert.equal(row.averageWage.quality, 'official_notice_repost_production_ready_pending_original_url');
  assert.equal(row.dataQuality.missingFields.includes('平均工资原始官方页面URL'), true);
});

test('Shanghai 2003 employee personal rate segments are cross-checked without clearing official URL gaps', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2003);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-standard-2003-public-report');
  const policySource = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-pension-rate-adjustment-2003-policy-repost');

  assert.ok(row, 'missing Shanghai 2003');
  assert.ok(source, 'missing Shanghai 2003 social insurance standard source');
  assert.ok(policySource, 'missing Shanghai 2003 pension rate adjustment source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(policySource.review.status, 'production_ready');
  assert.ok(source.review.reviewedBy, 'reviewedBy');
  assert.ok(source.review.reviewedAt, 'reviewedAt');
  assert.equal(source.extractedValues.contributionBaseFloor, 974);
  assert.equal(source.extractedValues.contributionBaseCeiling, 4869);
  assert.equal(source.extractedValues.employerRate, 0.225);
  assert.equal(source.extractedValues.employeePersonalRateFrom20030801, 0.08);
  assert.equal(source.extractedValues.employeePersonalRateBefore20030801, 0.07);
  assert.equal(policySource.extractedValues.employeePersonalRateFrom20030801, 0.08);
  assert.equal(policySource.extractedValues.employeePersonalRateBefore20030801, 0.07);
  assert.equal(row.contributionBase.employee.quality, 'public_document_cross_checked_production_ready_pending_original_url');
  assert.equal(row.contributionBase.flexible.quality, 'public_document_cross_checked_production_ready_pending_original_url');
  assert.deepEqual(row.rates.employeePersonalRateSegments, [
    {
      effectiveFrom: '2003-04-01',
      effectiveTo: '2003-07-31',
      employeePersonalRate: 0.07,
      sourceIds: [
        'shanghai-pension-rate-adjustment-2003-policy-repost',
        'shanghai-social-insurance-standard-2003-public-report'
      ],
      quality: 'policy_repost_cross_checked_production_ready_pending_original_url'
    },
    {
      effectiveFrom: '2003-08-01',
      effectiveTo: '2004-03-31',
      employeePersonalRate: 0.08,
      sourceIds: [
        'shanghai-pension-rate-adjustment-2003-policy-repost',
        'shanghai-social-insurance-standard-2003-public-report'
      ],
      quality: 'policy_repost_cross_checked_production_ready_pending_original_url'
    }
  ]);
  assert.equal(
    row.dataQuality.missingFields.includes('社保缴费标准原始官方页面URL'),
    true
  );
  assert.equal(
    row.dataQuality.missingFields.includes('2003-04-01至2003-07-31养老保险个人缴费比例口径'),
    false
  );
});

test('Shanghai 2004 social insurance standard public document is cross-checked with official sources', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2004);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-standard-2004-public-report');

  assert.ok(row, 'missing Shanghai 2004');
  assert.ok(source, 'missing Shanghai 2004 social insurance standard source');
  assert.equal(source.review.status, 'production_ready');
  assert.ok(source.review.reviewedBy, 'reviewedBy');
  assert.ok(source.review.reviewedAt, 'reviewedAt');
  assert.equal(source.extractedValues.contributionBaseFloor, 1108);
  assert.equal(source.extractedValues.contributionBaseCeiling, 5541);
  assert.equal(source.extractedValues.employerRate, 0.225);
  assert.equal(source.extractedValues.employeePersonalRate, 0.08);
  assert.equal(row.contributionBase.employee.quality, 'official_district_repost_and_public_document_production_ready_pending_original_url');
  assert.equal(row.contributionBase.flexible.quality, 'official_district_repost_and_public_document_production_ready_pending_original_url');
  assert.equal(row.dataQuality.missingFields.includes('社保缴费标准原始官方页面URL'), true);
  assert.equal(row.dataQuality.missingFields.includes('养老保险费率原始官方页面URL'), false);
});

test('Shanghai 2005 public social insurance report is reviewed while rate gaps remain explicit', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2005);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-standard-2005-public-report');
  const nationalSource = sourceCatalog.sources.find((item) => item.sourceId === 'national-enterprise-pension-system-2005');
  const localSource = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-pension-rate-adjustment-2003-policy-repost');

  assert.ok(row, 'missing Shanghai 2005');
  assert.ok(source, 'missing Shanghai 2005 social insurance standard source');
  assert.ok(nationalSource, 'missing national 2005 pension system source');
  assert.ok(localSource, 'missing Shanghai 2003 pension adjustment source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(nationalSource.review.status, 'production_ready');
  assert.equal(localSource.review.status, 'production_ready');
  assert.ok(source.review.reviewedBy, 'reviewedBy');
  assert.ok(source.review.reviewedAt, 'reviewedAt');
  assert.equal(source.extractedValues.contributionBaseFloor, 1220);
  assert.equal(source.extractedValues.contributionBaseCeiling, 6099);
  assert.equal(source.extractedValues.employerRate, 0.22);
  assert.equal(source.extractedValues.employeePersonalRate, 0.08);
  assert.equal(localSource.extractedValues.inferredPersonalAccountCreditRateBefore20060101, 0.11);
  assert.equal(row.contributionBase.employee.quality, 'official_notice_repost_and_public_report_production_ready_pending_original_url');
  assert.equal(row.contributionBase.flexible.quality, 'official_notice_repost_and_public_report_production_ready_pending_original_url');
  assert.equal(row.rates.quality, 'public_report_policy_repost_and_transition_rule_cross_checked_pending_rate_original_url');
  assert.deepEqual(row.rates.personalAccountCreditRateSegments, [
    {
      effectiveFrom: '2005-04-01',
      effectiveTo: '2005-12-31',
      personalAccountCreditRate: 0.11,
      sourceIds: ['shanghai-pension-rate-adjustment-2003-policy-repost'],
      quality: 'policy_repost_cross_checked_production_ready_pending_original_rate_url'
    },
    {
      effectiveFrom: '2006-01-01',
      effectiveTo: '2006-03-31',
      personalAccountCreditRate: 0.08,
      sourceIds: ['national-enterprise-pension-system-2005'],
      quality: 'national_policy_production_ready'
    }
  ]);
  assert.equal(row.dataQuality.missingFields.includes('养老保险费率原始官方页面URL'), true);
  assert.equal(row.dataQuality.missingFields.includes('2006-01-01至2006-03-31个人账户划入比例口径'), false);
});

test('core official policy and Shanghai parameter sources are production ready', () => {
  for (const sourceId of productionReadyOfficialPolicySources) {
    const source = sourceCatalog.sources.find((item) => item.sourceId === sourceId);
    assert.ok(source, `missing source ${sourceId}`);
    assert.equal(source.review.status, 'production_ready', `review status ${sourceId}`);
    assert.ok(source.review.reviewedBy, `reviewedBy ${sourceId}`);
    assert.ok(source.review.reviewedAt, `reviewedAt ${sourceId}`);
  }
});

test('official historical Shanghai wage and contribution standard sources are production ready', () => {
  for (const sourceId of productionReadyOfficialHistoricalSources) {
    const source = sourceCatalog.sources.find((item) => item.sourceId === sourceId);
    assert.ok(source, `missing source ${sourceId}`);
    assert.equal(source.review.status, 'production_ready', `review status ${sourceId}`);
    assert.ok(source.review.reviewedBy, `reviewedBy ${sourceId}`);
    assert.ok(source.review.reviewedAt, `reviewedAt ${sourceId}`);
  }

  for (const [sourceId, expectedUrl] of Object.entries(correctedHistoricalSourceUrls)) {
    const source = sourceCatalog.sources.find((item) => item.sourceId === sourceId);
    assert.equal(source.url, expectedUrl, `source url ${sourceId}`);
  }
});

test('Shanghai 2006 official wage source clears stale official URL gaps', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2006);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-average-wage-2005-public-report');

  assert.ok(row, 'missing Shanghai 2006');
  assert.ok(source, 'missing Shanghai 2005 wage source');
  assert.equal(source.url, 'https://rsj.sh.gov.cn/ttjsj_17219/20200617/t0035_1372793.html');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(row.dataQuality.missingFields.includes('平均工资原始官方页面URL'), false);
  assert.equal(row.dataQuality.missingFields.includes('社保缴费标准原始官方页面URL'), false);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), true);
});

test('Shanghai 2007-2009 contribution bases rely on production-ready official wage sources', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const cases = [
    [2007, 'shanghai-average-wage-2006'],
    [2008, 'shanghai-average-wage-2007'],
    [2009, 'shanghai-average-wage-2008']
  ];

  for (const [year, sourceId] of cases) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);
    const source = sourceCatalog.sources.find((item) => item.sourceId === sourceId);

    assert.ok(row, `missing Shanghai ${year}`);
    assert.ok(source, `missing source ${sourceId}`);
    assert.equal(source.review.status, 'production_ready', `review status ${sourceId}`);
    assert.deepEqual(row.contributionBase.employee.sourceIds, [sourceId], `employee sourceIds ${year}`);
    assert.deepEqual(row.contributionBase.flexible.sourceIds, [sourceId], `flexible sourceIds ${year}`);
    assert.equal(
      row.dataQuality.missingFields.includes('社保缴费标准原始官方页面URL'),
      false,
      `stale social insurance standard URL gap ${year}`
    );
  }
});

test('Shanghai 2008 and 2009 fully sourced years are production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;

  for (const year of [2008, 2009]) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);

    assert.ok(row, `missing Shanghai ${year}`);
    assert.equal(row.dataQuality.reviewStatus, 'production_ready', `review ${year}`);
    assert.equal(row.dataQuality.missingFields.length, 0, `missing fields ${year}`);
    assert.doesNotMatch(row.averageWage.quality, /pending|candidate/i, `averageWage ${year}`);
    assert.doesNotMatch(row.pensionCalculationBase.quality, /pending|candidate/i, `pensionCalculationBase ${year}`);
    assert.doesNotMatch(row.contributionBase.employee.quality, /pending|candidate/i, `employee ${year}`);
    assert.doesNotMatch(row.contributionBase.flexible.quality, /pending|candidate/i, `flexible ${year}`);
    assert.doesNotMatch(row.rates.quality, /pending|candidate/i, `rates ${year}`);
    assert.doesNotMatch(row.accountInterestRate.quality, /pending|candidate/i, `accountInterestRate ${year}`);
  }
});

test('Shanghai 2006-2009 rates rely on production-ready policy sources instead of public reports', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const stalePublicReportPattern = /shanghai-social-insurance-standard-200[6-9]-public-report/;

  for (const year of [2006, 2007, 2008, 2009]) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);
    assert.ok(row, `missing Shanghai ${year}`);
    assert.deepEqual(
      row.rates.sourceIds,
      ['shanghai-pension-rate-adjustment-2004-policy-repost', 'national-enterprise-pension-system-2005'],
      `rates sourceIds ${year}`
    );
    assert.doesNotMatch(JSON.stringify(row.rates.sourceIds), stalePublicReportPattern, `stale rate source ${year}`);
    assert.equal(row.rates.quality, 'official_policy_production_ready');
  }
});

test('Shanghai 2014 social insurance standard source is cross-checked and production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2014);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-standard-2014');

  assert.ok(row, 'missing Shanghai 2014');
  assert.ok(source, 'missing Shanghai 2014 social insurance standard source');
  assert.equal(source.review.status, 'production_ready');
  assert.ok(source.review.reviewedBy, 'reviewedBy');
  assert.ok(source.review.reviewedAt, 'reviewedAt');
  assert.equal(source.extractedValues.averageWage, 5036);
  assert.equal(source.extractedValues.contributionBaseFloor, 3022);
  assert.equal(source.extractedValues.contributionBaseCeiling, 15108);
  assert.equal(source.extractedValues.employerRate, 0.21);
  assert.equal(source.extractedValues.employeePersonalRate, 0.08);
  assert.deepEqual(row.averageWage.sourceIds, ['shanghai-social-insurance-standard-2014']);
  assert.deepEqual(row.contributionBase.employee.sourceIds, ['shanghai-social-insurance-standard-2014']);
  assert.deepEqual(row.rates.sourceIds, ['shanghai-social-insurance-standard-2014', 'national-enterprise-pension-system-2005']);
  assert.equal(row.dataQuality.missingFields.includes('accountInterestRate'), false);
  assert.equal(row.dataQuality.reviewStatus, 'production_ready');
  assert.doesNotMatch(row.averageWage.quality, /pending|candidate/i);
  assert.doesNotMatch(row.contributionBase.employee.quality, /pending|candidate/i);
  assert.doesNotMatch(row.contributionBase.flexible.quality, /pending|candidate/i);
  assert.doesNotMatch(row.rates.quality, /pending|candidate/i);
});

test('Shanghai 2015 social insurance standard source is cross-checked and production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2015);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-standard-2015-public-report');

  assert.ok(row, 'missing Shanghai 2015');
  assert.ok(source, 'missing Shanghai 2015 social insurance standard source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.averageWage, 5451);
  assert.equal(source.extractedValues.contributionBaseFloor, 3271);
  assert.equal(source.extractedValues.contributionBaseCeiling, 16353);
  assert.deepEqual(row.averageWage.sourceIds, ['shanghai-social-insurance-standard-2015-public-report']);
  assert.deepEqual(row.contributionBase.employee.sourceIds, ['shanghai-social-insurance-standard-2015-public-report']);
  assert.deepEqual(row.contributionBase.flexible.sourceIds, ['shanghai-social-insurance-standard-2015-public-report']);
  assert.equal(row.dataQuality.reviewStatus, 'production_ready');
  assert.equal(row.dataQuality.missingFields.length, 0);
  assert.doesNotMatch(row.averageWage.quality, /pending|candidate/i);
  assert.doesNotMatch(row.pensionCalculationBase.quality, /pending|candidate/i);
  assert.doesNotMatch(row.contributionBase.employee.quality, /pending|candidate/i);
  assert.doesNotMatch(row.contributionBase.flexible.quality, /pending|candidate/i);
  assert.doesNotMatch(row.rates.quality, /pending|candidate/i);
});

test('Shanghai 2023 contribution base source is production ready and year-specific', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2023);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-base-2023');

  assert.ok(row, 'missing Shanghai 2023');
  assert.ok(source, 'missing Shanghai 2023 social insurance base source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.averageWage, 12183);
  assert.equal(source.extractedValues.contributionBaseFloor, 7310);
  assert.equal(source.extractedValues.contributionBaseCeiling, 36549);
  assert.deepEqual(row.averageWage.sourceIds, ['shanghai-social-insurance-base-2023']);
  assert.deepEqual(row.contributionBase.employee.sourceIds, ['shanghai-social-insurance-base-2023']);
  assert.deepEqual(row.contributionBase.flexible.sourceIds, ['shanghai-social-insurance-base-2023']);
  assert.equal(row.dataQuality.reviewStatus, 'production_ready');
  assert.doesNotMatch(row.averageWage.quality, /pending|candidate/i);
  assert.doesNotMatch(row.pensionCalculationBase.quality, /pending|candidate/i);
  assert.doesNotMatch(row.contributionBase.employee.quality, /pending|candidate/i);
  assert.doesNotMatch(row.contributionBase.flexible.quality, /pending|candidate/i);
  assert.doesNotMatch(row.rates.quality, /pending|candidate/i);
  assert.doesNotMatch(row.accountInterestRate.quality, /pending|candidate/i);
});

test('Shanghai 2022 contribution base source is production ready and documents the transition floor', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const row = shanghai.yearlyParams.find((item) => item.year === 2022);
  const source = sourceCatalog.sources.find((item) => item.sourceId === 'shanghai-social-insurance-base-2022-official-wechat-repost');

  assert.ok(row, 'missing Shanghai 2022');
  assert.ok(source, 'missing Shanghai 2022 social insurance base source');
  assert.equal(source.review.status, 'production_ready');
  assert.equal(source.extractedValues.averageWage, 11396);
  assert.equal(source.extractedValues.contributionBaseFloor, 6520);
  assert.equal(source.extractedValues.contributionBaseCeiling, 34188);
  assert.deepEqual(row.contributionBase.employee.sourceIds, ['shanghai-social-insurance-base-2022-official-wechat-repost']);
  assert.deepEqual(row.contributionBase.flexible.sourceIds, ['shanghai-social-insurance-base-2022-official-wechat-repost']);
  assert.equal(row.dataQuality.reviewStatus, 'production_ready');
  assert.doesNotMatch(row.averageWage.quality, /pending|candidate/i);
  assert.doesNotMatch(row.pensionCalculationBase.quality, /pending|candidate/i);
  assert.doesNotMatch(row.contributionBase.employee.quality, /pending|candidate/i);
  assert.doesNotMatch(row.contributionBase.flexible.quality, /pending|candidate/i);
  assert.doesNotMatch(row.rates.quality, /pending|candidate/i);
  assert.doesNotMatch(row.accountInterestRate.quality, /pending|candidate/i);
});

test('Shanghai selected 2016-2019 official contribution sources are production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const cases = [
    [2016, 'shanghai-social-insurance-standard-2016', 5939, 3563, 17817],
    [2017, 'shanghai-social-insurance-base-2017-hrss-report', 6504, 3902, 19512],
    [2018, 'shanghai-social-insurance-standard-2018', 7132, 4279, 21396],
    [2019, 'shanghai-social-insurance-base-2019', 8211, 4927, 24633]
  ];

  for (const [year, sourceId, averageWage, floor, ceiling] of cases) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);
    const source = sourceCatalog.sources.find((item) => item.sourceId === sourceId);

    assert.ok(row, `missing Shanghai ${year}`);
    assert.ok(source, `missing source ${sourceId}`);
    assert.equal(source.review.status, 'production_ready', `review status ${sourceId}`);
    assert.equal(source.extractedValues.averageWage, averageWage, `averageWage ${sourceId}`);
    assert.equal(source.extractedValues.contributionBaseFloor, floor, `floor ${sourceId}`);
    assert.equal(source.extractedValues.contributionBaseCeiling, ceiling, `ceiling ${sourceId}`);
    assert.deepEqual(row.contributionBase.employee.sourceIds, [sourceId], `employee source ${year}`);
    assert.deepEqual(row.contributionBase.flexible.sourceIds, [sourceId], `flexible source ${year}`);
    assert.equal(row.dataQuality.reviewStatus, 'production_ready', `review ${year}`);
    assert.doesNotMatch(row.averageWage.quality, /pending|candidate/i, `averageWage quality ${year}`);
    assert.doesNotMatch(row.contributionBase.employee.quality, /pending|candidate/i, `employee quality ${year}`);
    assert.doesNotMatch(row.contributionBase.flexible.quality, /pending|candidate/i, `flexible quality ${year}`);
    assert.doesNotMatch(row.rates.quality, /pending|candidate/i, `rates quality ${year}`);
    assert.doesNotMatch(row.accountInterestRate.quality, /pending|candidate/i, `account quality ${year}`);
  }
});

test('Shanghai fully reviewed modern official years are marked production ready', () => {
  const shanghai = cityHistoryParams.cities.shanghai;
  const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  for (const year of years) {
    const row = shanghai.yearlyParams.find((item) => item.year === year);
    assert.ok(row, `missing Shanghai ${year}`);
    assert.deepEqual(row.dataQuality.missingFields, [], `missingFields ${year}`);
    assert.equal(row.dataQuality.reviewStatus, 'production_ready', `reviewStatus ${year}`);
    assert.doesNotMatch(row.averageWage.quality, /pending|candidate/i, `averageWage quality ${year}`);
    assert.doesNotMatch(row.pensionCalculationBase.quality, /pending|candidate/i, `pensionCalculationBase quality ${year}`);
    assert.doesNotMatch(row.contributionBase.employee.quality, /pending|candidate/i, `employee contributionBase quality ${year}`);
    assert.doesNotMatch(row.contributionBase.flexible.quality, /pending|candidate/i, `flexible contributionBase quality ${year}`);
    assert.doesNotMatch(row.rates.quality, /pending|candidate/i, `rates quality ${year}`);
    assert.doesNotMatch(row.accountInterestRate.quality, /pending|candidate/i, `accountInterestRate quality ${year}`);
  }
});
