import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const outputPath = path.join(root, 'data/generated/city-data-backfill-tasks.json');
const firstLaunchCity = 'shanghai';
const sourceFiles = [
  'data/official/city-history-coverage.json',
  'data/official/city-history-params.json',
  'data/official/city-params.json',
  'data/official/sources.json',
  'data/official/source-backlog-2026-05-28.json'
];
const requiredHistoricalFields = [
  'averageWage',
  'pensionCalculationBase',
  'contributionBase.employee.floor',
  'contributionBase.employee.ceiling',
  'contributionBase.flexible.floor',
  'contributionBase.flexible.ceiling',
  'rates.employeePersonalRate',
  'rates.employerRate',
  'rates.personalAccountCreditRate',
  'accountInterestRate'
];
const commonVerificationCommands = [
  'npm run data:backfill-tasks',
  'npm run verify:data',
  'npm run verify:data-readiness'
];
const missingFieldSourceLeads = {
  'shanghai:2005:accountInterestRate': {
    knownRelatedUrls: [
      'https://zc.51shebao.com/detail/814603',
      'https://m.110.com/fagui/302392.html'
    ],
    searchQueries: [
      '上海市劳动和社会保障局 关于公布2005年度本市养老保险个人账户记账利率的通知',
      '2005年度本市养老保险个人账户记账利率 沪劳保基发 上海',
      '2005年度本市城镇养老保险个人账户记账利率 上海'
    ],
    notes: '优先定位上海劳动保障局原文或法规库转载全文；相邻 2004、2008 年已在法规库中找到正文。'
  },
  'shanghai:2006:accountInterestRate': {
    knownRelatedUrls: [
      'https://zc.51shebao.com/detail/814603',
      'https://m.110.com/fagui/302392.html'
    ],
    searchQueries: [
      '上海市劳动和社会保障局 关于公布2006年度本市养老保险个人账户记账利率的通知',
      '2006年度本市养老保险个人账户记账利率 沪劳保基发 上海',
      '2006年度本市城镇养老保险个人账户记账利率 上海'
    ],
    notes: '重点核对 2006 年是否存在独立记账利率通知，以及是否和 2006-04 至 2007-03 社保年度口径一致。'
  },
  'shanghai:2007:accountInterestRate': {
    knownRelatedUrls: [
      'https://zc.51shebao.com/detail/814603',
      'https://m.110.com/fagui/302392.html'
    ],
    searchQueries: [
      '上海市劳动和社会保障局 关于公布2007年度本市养老保险个人账户记账利率的通知',
      '2007年度本市养老保险个人账户记账利率 沪劳保基发 上海',
      '2007年度本市城镇养老保险个人账户记账利率 上海'
    ],
    notes: '2008 年记账利率通知已定位，继续沿同一法规库、上海人社失效文件目录和沪劳保基发文号追溯上一年度。'
  },
  'shanghai:2013:accountInterestRate': {
    knownRelatedUrls: [
      'https://www.chinanews.com.cn/sh/2014/06-27/6327411.shtml',
      'https://www.laodongfa.com/hot/7360.html',
      'https://m.21jingji.com/article/20150416/b35524a457fd394f010ff277920de866.html'
    ],
    searchQueries: [
      '上海市人力资源和社会保障局 关于公布2013年度本市养老保险个人账户记账利率的通知',
      '2013年度本市养老保险个人账户记账利率 沪人社基发 上海',
      '2013年度上海市养老保险个人权益记录单 记账利率'
    ],
    notes: '已定位 2013 年度权益记录单寄发报道，但未找到利率数值；可结合上海人社失效文件目录和 2014 年相邻通知继续追溯。'
  }
};
const shanghaiAverageWageLeadsByYear = {
  2000: {
    knownRelatedUrls: ['https://www.laodongfa.com/stadata/dfzf/84.html'],
    searchQueries: [
      '沪劳保综发〔2000〕19号 上海市1999年度职工平均工资 上海人社',
      '上海市1999年度职工平均工资 沪劳保综发〔2000〕19号 原文'
    ]
  },
  2001: {
    knownRelatedUrls: ['https://www.laodongfa.com/stadata/dfzf/85.html'],
    searchQueries: [
      '沪劳保综发〔2001〕17号 上海市2000年度职工平均工资 上海人社',
      '上海市2000年度职工平均工资 沪劳保综发〔2001〕17号 原文'
    ]
  },
  2002: {
    knownRelatedUrls: ['https://www.laodongfa.com/hot/6873.html'],
    searchQueries: [
      '沪劳保综发〔2002〕13号 上海市2001年度职工平均工资 上海人社',
      '上海市2001年度职工平均工资 沪劳保综发〔2002〕13号 原文'
    ]
  },
  2003: {
    knownRelatedUrls: ['https://www.laodongfa.com/hot/6874.html'],
    searchQueries: [
      '沪劳保综发〔2003〕8号 上海市2002年度职工平均工资 上海人社',
      '上海市2002年度职工平均工资 沪劳保综发〔2003〕8号 原文'
    ]
  },
  2004: {
    knownRelatedUrls: ['https://www.laodongfa.com/stadata/dfzf/3052.html'],
    searchQueries: [
      '沪劳保综发〔2004〕12号 上海市2003年度职工平均工资 上海人社',
      '上海市2003年度职工平均工资 沪劳保综发〔2004〕12号 原文'
    ]
  },
  2005: {
    knownRelatedUrls: ['https://www.110.com/fagui/law_224832.html'],
    searchQueries: [
      '沪劳保综发〔2005〕10号 本市职工平均工资 2005年度城镇养老保险缴费基数 上海人社',
      '关于确定本市职工平均工资及2005年度城镇养老保险缴费基数上下限 原文'
    ]
  }
};

function getPatternSourceLead(city, year, field) {
  if (city !== 'shanghai') return null;

  if (field === '平均工资原始官方页面URL') {
    const lead = shanghaiAverageWageLeadsByYear[year];
    return lead ? {
      ...lead,
      notes: '已有法规库或公开转载来源，下一步优先定位上海人社原始页面或政府信息公开原文。'
    } : null;
  }

  if (field === '社保缴费标准原始官方页面URL') {
    const knownRelatedUrls = [];
    if (year <= 2002) {
      knownRelatedUrls.push(
        ...(shanghaiAverageWageLeadsByYear[year]?.knownRelatedUrls || []),
        'https://rsj.sh.gov.cn/txgszfgz_17262/20200617/t0035_1388537.html'
      );
    }
    if (year === 2003 || year === 2004) {
      knownRelatedUrls.push('https://max.book118.com/html/2017/0503/104008070.shtm');
    }
    if (year === 2005) {
      knownRelatedUrls.push('https://finance.sina.com.cn/roll/20050325/03241458714.shtml');
    }

    return {
      knownRelatedUrls,
      searchQueries: [
        `${year}年度上海市社会保险费缴费标准 上海人社 原文`,
        `${year}年上海市社会保险费缴费标准 缴费基数 下限 上限`,
        `${year}年度城镇养老保险缴费基数上下限 上海`
      ],
      notes: '已有工资或公开报道来源可交叉核对，仍需定位原始官方标准页后才能移除缺失字段。'
    };
  }

  if (field === '养老保险费率原始官方页面URL') {
    return {
      knownRelatedUrls: [
        'https://zc.51shebao.com/detail/814564',
        'https://rsj.sh.gov.cn/txgszfgz_17262/20200617/t0035_1388490.html',
        'https://www.gov.cn/zwgk/2005-12/14/content_127311.htm'
      ],
      searchQueries: [
        `${year}年度上海养老保险费率 单位缴费比例 个人缴费比例 原文`,
        `${year}年度上海城镇从业人员养老保险缴费比例 沪劳保养发`,
        `${year}年度上海社会保险费缴费比例 养老保险`
      ],
      notes: '已有 2000 年单位费率调整、2003 年个人费率调整和 2005 年国务院统账规则来源，仍需定位对应年度上海原始费率页。'
    };
  }

  if (/养老保险个人账户划入比例口径/.test(field) || field === '2006-01-01至2006-03-31个人账户划入比例口径') {
    return {
      knownRelatedUrls: [
        'https://rsj.sh.gov.cn/txgszfgz_17262/20200617/t0035_1388537.html',
        'https://zc.51shebao.com/detail/814564',
        'https://www.gov.cn/zwgk/2005-12/14/content_127311.htm'
      ],
      searchQueries: [
        `${year}年度上海养老保险个人账户划入比例 单位划入 个人缴费 口径`,
        `${year}年度上海养老保险个人账户规模 11% 8% 过渡`,
        `${year}年度上海城镇养老保险个人账户记入比例 原文`
      ],
      notes: '早年个人账户规模涉及地方统账结合与 2006 年国家制度切换，必须确认分段口径后再移除缺失字段。'
    };
  }

  if (field === '2003-04-01至2003-07-31养老保险个人缴费比例口径') {
    return {
      knownRelatedUrls: [
        'https://zc.51shebao.com/detail/814564',
        'https://max.book118.com/html/2017/0503/104008070.shtm'
      ],
      searchQueries: [
        '2003-04-01至2003-07-31 上海养老保险个人缴费比例',
        '沪劳保养发〔2003〕36号 2003年8月1日 个人缴费比例 7% 8%',
        '2003年度上海社会保险费缴费标准 养老保险个人8%'
      ],
      notes: '2003 年 8 月起个人费率调整为 8%，仍需确认 4-7 月是否沿用 7% 及其缴费标准表口径。'
    };
  }

  if (field === '2011-04-01至2011-06-30缴费基数口径') {
    return {
      knownRelatedUrls: [
        'https://rsj.sh.gov.cn/tqtwj_17340/20200617/t0035_1389013.html',
        'https://rsj.sh.gov.cn/tqtwj_17340/20200617/t0035_1389009.html'
      ],
      searchQueries: [
        '2011-04-01至2011-06-30 上海社会保险费缴费标准',
        '2010年上海市社会保险费缴费标准 有效期 2011年3月31日 2011年6月30日',
        '2011年上海市社会保险费缴费标准 2011-07-01 之前'
      ],
      notes: '当前已定位 2010 与 2011 标准页，需确认 2011-04 至 2011-06 是否延续上一社保年度或存在过渡通知。'
    };
  }

  return null;
}

function getTaskTargetFiles(type) {
  switch (type) {
    case 'city-status-review':
      return [
        'data/official/city-params.json',
        'data/official/city-history-coverage.json'
      ];
    case 'backfill-year-params':
    case 'fill-missing-fields':
    case 'production-ready-review':
      return [
        'data/official/city-history-params.json',
        'data/official/city-history-coverage.json',
        'data/official/sources.json',
        'data/generated/shanghai-amount-expected-values.json',
        'miniprogram/data/runtime-data.js'
      ];
    case 'source-backlog-review':
    case 'source-production-review':
      return [
        'data/official/source-backlog-2026-05-28.json',
        'data/official/sources.json',
        'data/official/city-history-params.json',
        'miniprogram/data/runtime-data.js'
      ];
    default:
      return sourceFiles;
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function getSourceGeneratedAt() {
  const latestMtime = Math.max(
    ...sourceFiles.map((relativePath) => fs.statSync(path.join(root, relativePath)).mtimeMs)
  );
  return new Date(latestMtime).toISOString();
}

function formatTaskId(parts) {
  return parts.filter(Boolean).join(':').replace(/[^a-z0-9:_-]+/gi, '-').toLowerCase();
}

function getYearParam(historyParams, city, year) {
  const cityHistory = historyParams.cities[city];
  if (!cityHistory || !Array.isArray(cityHistory.yearlyParams)) return null;
  return cityHistory.yearlyParams.find((item) => item.year === year) || null;
}

function isWithinRange(range, year) {
  return Boolean(range && typeof range.from === 'number' && typeof range.to === 'number' && year >= range.from && year <= range.to);
}

function getYearPriority(cityCoverage, isFirstLaunchCity, year) {
  if (!isFirstLaunchCity) return 'P1';
  if (cityCoverage.publicSupportedYearRange && !isWithinRange(cityCoverage.publicSupportedYearRange, year)) {
    return 'P1';
  }
  return 'P0';
}

function getMissingSourceFields(yearParam) {
  const missing = [];
  if (!yearParam) return missing;

  const sourceAwareFields = [
    ['averageWage', yearParam.averageWage],
    ['pensionCalculationBase', yearParam.pensionCalculationBase],
    ['contributionBase.employee', yearParam.contributionBase && yearParam.contributionBase.employee],
    ['contributionBase.flexible', yearParam.contributionBase && yearParam.contributionBase.flexible],
    ['rates', yearParam.rates]
  ];

  for (const [name, value] of sourceAwareFields) {
    const sourceIds = value && Array.isArray(value.sourceIds) ? value.sourceIds : [];
    const quality = value && value.quality ? value.quality : '';
    if (sourceIds.length === 0 || /candidate|pending/i.test(quality)) {
      missing.push(name);
    }
  }

  return missing;
}

function collectSourceIds(value, sourceIds = new Set()) {
  if (!value || typeof value !== 'object') return sourceIds;

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSourceIds(item, sourceIds);
    }
    return sourceIds;
  }

  if (Array.isArray(value.sourceIds)) {
    for (const sourceId of value.sourceIds) {
      if (sourceId) sourceIds.add(sourceId);
    }
  }

  for (const child of Object.values(value)) {
    collectSourceIds(child, sourceIds);
  }

  return sourceIds;
}

function getSourceById(sources) {
  return new Map((sources.sources || []).map((source) => [source.sourceId, source]));
}

function createTask({
  city,
  cityName,
  type,
  year,
  sourceId,
  priority,
  title,
  requiredFields = [],
  sourceLeads = {},
  sourceStatus = '',
  targetFiles,
  verificationCommands = commonVerificationCommands,
  acceptance = [],
  notes = ''
}) {
  return {
    id: formatTaskId(['data', city, year || sourceId, type]),
    city,
    cityName,
    year,
    sourceId,
    type,
    priority,
    title,
    requiredFields,
    sourceLeads,
    sourceStatus,
    targetFiles: targetFiles || getTaskTargetFiles(type),
    verificationCommands,
    acceptance,
    notes
  };
}

function getMissingFieldSourceLeads(city, year, missingFields) {
  const leads = {};
  for (const field of missingFields) {
    const lead =
      missingFieldSourceLeads[`${city}:${year}:${field}`] ||
      getPatternSourceLead(city, year, field);
    if (lead) leads[field] = lead;
  }
  return leads;
}

const coverage = readJson('data/official/city-history-coverage.json');
const historyParams = readJson('data/official/city-history-params.json');
const cityParams = readJson('data/official/city-params.json');
const sourceCatalog = readJson('data/official/sources.json');
const sourceBacklog = readJson('data/official/source-backlog-2026-05-28.json');
const sourceById = getSourceById(sourceCatalog);
const tasks = [];

for (const [city, cityCoverage] of Object.entries(coverage.cities)) {
  const cityName = cityCoverage.name || (cityParams.cities[city] && cityParams.cities[city].name) || city;
  const isFirstLaunchCity = city === firstLaunchCity;
  const cityPriority = isFirstLaunchCity ? 'P0' : 'P2';
  const status = cityParams.cities[city] && cityParams.cities[city].status;

  if (status !== 'ready') {
    tasks.push(createTask({
      city,
      cityName,
      type: 'city-status-review',
      priority: cityPriority,
      title: `${cityName}城市状态复核为 ready`,
      sourceStatus: status || 'missing',
      acceptance: [
        'city-params.json 中城市 status 调整为 ready 前，所有年份参数必须完成 production ready 复核',
        'release gate 可确认该城市允许普通用户测算'
      ],
      notes: isFirstLaunchCity ? '首开城市发布硬门槛。' : '后续城市开放前处理。'
    }));
  }

  for (const year of cityCoverage.missingYears || []) {
    tasks.push(createTask({
      city,
      cityName,
      year,
      type: 'backfill-year-params',
      priority: getYearPriority(cityCoverage, isFirstLaunchCity, year),
      title: `${cityName} ${year} 年历史参数回补`,
      requiredFields: requiredHistoricalFields,
      sourceStatus: 'missing',
      acceptance: [
        'city-history-params.json 存在该年份 yearlyParams 记录',
        '字段有官方来源 sourceIds 或明确降级策略',
        'dataQuality.level 不再是 missing',
        'coverage.missingYears 移除该年份'
      ],
      notes: `${cityCoverage.nextBackfillBatch || '历史缺失年份'} 回补任务。`
    }));
  }

  for (const year of cityCoverage.partialYears || []) {
    const yearParam = getYearParam(historyParams, city, year);
    const missingFields = yearParam && yearParam.dataQuality && Array.isArray(yearParam.dataQuality.missingFields)
      ? yearParam.dataQuality.missingFields
      : [];
    const missingSourceFields = getMissingSourceFields(yearParam);

    if (missingFields.length > 0) {
      tasks.push(createTask({
        city,
        cityName,
        year,
        type: 'fill-missing-fields',
        priority: getYearPriority(cityCoverage, isFirstLaunchCity, year),
        title: `${cityName} ${year} 年缺失字段补齐`,
        requiredFields: missingFields,
        sourceLeads: getMissingFieldSourceLeads(city, year, missingFields),
        sourceStatus: yearParam && yearParam.dataQuality ? yearParam.dataQuality.reviewStatus : 'missing-year-param',
        acceptance: [
          '缺失字段从 dataQuality.missingFields 移除',
          '字段值、来源、采集说明和复核状态同步更新',
          '金额 expected values 重新生成并通过测试'
        ],
        notes: missingFields.includes('accountInterestRate')
          ? '个人账户记账利率缺失会扩大未知账户余额用户的估算误差。'
          : ''
      }));
    }

    if (!yearParam || !yearParam.dataQuality || yearParam.dataQuality.reviewStatus !== 'production_ready') {
      tasks.push(createTask({
        city,
        cityName,
        year,
        type: 'production-ready-review',
        priority: getYearPriority(cityCoverage, isFirstLaunchCity, year),
        title: `${cityName} ${year} 年参数 production ready 复核`,
        requiredFields: missingSourceFields,
        sourceStatus: yearParam && yearParam.dataQuality ? yearParam.dataQuality.reviewStatus : 'missing-year-param',
        acceptance: [
          '关键字段来源已二次复核',
          '候选来源或空 sourceIds 已补齐',
          'dataQuality.reviewStatus 标记为 production_ready',
          'coverage.partialYears 移除该年份并进入 officialCompleteYears'
        ],
        notes: missingSourceFields.length > 0
          ? `需优先复核来源字段：${missingSourceFields.join(', ')}。`
          : ''
      }));
    }
  }

  const cityHistory = historyParams.cities[city];
  const referencedSourceIds = collectSourceIds(cityHistory && cityHistory.yearlyParams);
  for (const sourceId of Array.from(referencedSourceIds).sort()) {
    const source = sourceById.get(sourceId);
    if (!source) continue;

    const sourceReviewStatus = source.review && source.review.status;
    if (sourceReviewStatus === 'production_ready') continue;

    tasks.push(createTask({
      city,
      cityName,
      sourceId,
      type: 'source-production-review',
      priority: cityPriority,
      title: `${cityName}引用来源 ${sourceId} production ready 复核`,
      requiredFields: ['sourceReview'],
      sourceStatus: sourceReviewStatus || 'missing',
      targetFiles: [
        'data/official/sources.json',
        'data/official/city-history-params.json',
        'miniprogram/data/runtime-data.js'
      ],
      acceptance: [
        'sources.json 中该 sourceId 的 review.status 标记为 production_ready',
        'reviewedBy 和 reviewedAt 已填写',
        '引用该 sourceId 的城市历史参数仍通过 verify:data-readiness'
      ],
      notes: source.title || ''
    }));
  }
}

for (const item of sourceBacklog.items || []) {
  tasks.push(createTask({
    city: item.region,
    cityName: item.region,
    sourceId: item.sourceId,
    type: 'source-backlog-review',
    priority: item.region === firstLaunchCity ? 'P0' : 'P2',
    title: item.title,
    requiredFields: item.url ? ['secondReview'] : ['sourceUrl', 'secondReview'],
    sourceStatus: item.status,
    acceptance: [
      '补齐或确认官方 URL',
      'source-backlog 状态不再是 pending_source_url / pending_second_review',
      '必要时并入 data/official/sources.json',
      '关联到 city-history-params.json 中引用该来源的 sourceIds 并同步 runtime-data.js'
    ],
    notes: item.notes || ''
  }));
}

const report = {
  schemaVersion: '1.0',
  generatedAt: getSourceGeneratedAt(),
  firstLaunchCity,
  sourceFiles,
  summary: {
    totalTasks: tasks.length,
    byPriority: tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {}),
    byCity: tasks.reduce((acc, task) => {
      acc[task.city] = (acc[task.city] || 0) + 1;
      return acc;
    }, {})
  },
  tasks
};

const output = `${JSON.stringify(report, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
  if (existing !== output) {
    console.error(`${path.relative(root, outputPath)} is stale. Run npm run data:backfill-tasks.`);
    process.exit(1);
  }

  console.log(`OK ${path.relative(root, outputPath)} is current with ${tasks.length} tasks`);
} else {
  fs.writeFileSync(outputPath, output);
  console.log(`Generated ${path.relative(root, outputPath)} with ${tasks.length} tasks`);
}
