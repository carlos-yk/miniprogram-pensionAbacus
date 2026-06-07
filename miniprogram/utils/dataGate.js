const {
  cityParams,
  cityHistoryParams,
  cityHistoryCoverage,
  benchmarkMeta
} = require('../data/runtime-data');
const features = require('../config/features');

const CITY_STATUS_META = {
  partial_pending_second_review: {
    status: 'data_reviewing',
    label: '暂未开放',
    canSubmit: false,
    tone: 'warning',
    message: '该城市数据还在核对，暂未开放测算。'
  },
  partial_pending_city_applicability_review: {
    status: 'history_backfilling',
    label: '暂未开放',
    canSubmit: false,
    tone: 'warning',
    message: '该城市数据还在核对，暂未开放测算。'
  },
  ready: {
    status: 'ready',
    label: '可测算',
    canSubmit: true,
    tone: 'success',
    message: ''
  }
};

const REQUIRED_REVIEW_STATUS = 'production_ready';

const HISTORY_BACKFILL_META = {
  status: 'history_backfilling',
  label: '暂未开放',
  canSubmit: false,
  tone: 'warning',
  message: '该城市数据还在核对，暂未开放测算。'
};

const PREVIEW_META = {
  canPreview: true,
  previewLabel: '可试算',
  previewMessage: '可先试算，结果仅供参考。'
};

function getCityParam(city) {
  return cityParams.cities[city] || null;
}

function getCityCurrentYearParam(city) {
  const current = getCityParam(city);
  if (!current) return null;

  const ref = current.currentParamRef;
  const cityHistory = cityHistoryParams.cities[ref.city];
  if (!cityHistory) return null;

  return cityHistory.yearlyParams.find((item) => item.year === ref.year) || null;
}

function monthIndex(value) {
  const [year, month] = value.split('-').map(Number);
  return year * 12 + (month - 1);
}

function yearFromMonthIndex(index) {
  return Math.floor(index / 12);
}

function monthFromIndex(index) {
  const year = yearFromMonthIndex(index);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getParamMonthIndex(value) {
  if (!value) return null;
  return monthIndex(value.slice(0, 7));
}

function rangeYears(range) {
  if (!range || typeof range.from !== 'number' || typeof range.to !== 'number') return [];
  const years = [];
  for (let year = range.from; year <= range.to; year += 1) {
    years.push(year);
  }
  return years;
}

function getCityYearlyParams(city) {
  const history = cityHistoryParams.cities[city];
  if (!history || !Array.isArray(history.yearlyParams)) return [];
  return history.yearlyParams.slice().sort((a, b) => a.year - b.year);
}

function getYearParam(city, year, fallback) {
  const yearlyParams = getCityYearlyParams(city);
  if (yearlyParams.length === 0) return fallback;

  const exact = yearlyParams.find((param) => param.year === year);
  if (exact) return exact;

  if (year < yearlyParams[0].year) return yearlyParams[0];
  return yearlyParams[yearlyParams.length - 1];
}

function getYearParamForMonth(city, yearMonth, fallback) {
  const yearlyParams = getCityYearlyParams(city);
  if (yearlyParams.length === 0) return fallback;

  const targetMonthIndex = monthIndex(yearMonth);
  const effectiveMatch = yearlyParams.find((param) => {
    const from = getParamMonthIndex(param.effectiveFrom);
    const to = getParamMonthIndex(param.effectiveTo);
    return from !== null && targetMonthIndex >= from && (to === null || targetMonthIndex <= to);
  });

  if (effectiveMatch) return effectiveMatch;
  return getYearParam(city, yearFromMonthIndex(targetMonthIndex), fallback);
}

function hasCompleteHistoricalCoverage(coverage) {
  if (!coverage) return false;
  const officialYears = coverage.officialCompleteYears || [];
  const partialYears = coverage.partialYears || [];
  const missingYears = coverage.missingYears || [];
  const publicSupportedYears = rangeYears(coverage.publicSupportedYearRange);

  if (publicSupportedYears.length > 0) {
    const officialSet = new Set(officialYears);
    return publicSupportedYears.every((year) => officialSet.has(year));
  }

  return officialYears.length > 0 && partialYears.length === 0 && missingYears.length === 0;
}

function isYearParamProductionReady(yearParam) {
  if (!yearParam) return false;
  const dataQuality = yearParam.dataQuality || {};
  const missingFields = dataQuality.missingFields || [];
  return dataQuality.reviewStatus === REQUIRED_REVIEW_STATUS && missingFields.length === 0;
}

function getUnsupportedPaidHistoryYears({
  city,
  paidMonths,
  currentMonth = features.calculationAsOfMonth
}) {
  const months = Math.max(0, Number(paidMonths || 0));
  const currentParam = getCityCurrentYearParam(city);
  if (!city || months === 0 || !currentParam) return [];

  const unsupportedYears = new Set();
  const currentMonthIndex = monthIndex(currentMonth);

  for (let offset = months; offset > 0; offset -= 1) {
    const paidMonth = monthFromIndex(currentMonthIndex - offset);
    const yearParam = getYearParamForMonth(city, paidMonth, currentParam);

    if (!isYearParamProductionReady(yearParam)) {
      unsupportedYears.add(yearParam ? yearParam.year : yearFromMonthIndex(monthIndex(paidMonth)));
    }
  }

  return Array.from(unsupportedYears).sort((a, b) => a - b);
}

function isPaidHistorySupported(args) {
  return getUnsupportedPaidHistoryYears(args).length === 0;
}

function getPaidMonthsFromRecord(record) {
  if (!record) return null;
  if (typeof record.paidMonths === 'number') return record.paidMonths;
  if (record.contribution && typeof record.contribution.paidMonths === 'number') {
    return record.contribution.paidMonths;
  }
  return null;
}

function canUsePreview(gate, options) {
  if (!options.internalPreview || gate.canSubmit) return false;
  const previewCities = options.previewCities || [];
  return previewCities.includes(gate.city);
}

function applyPreviewMeta(gate, options = {}) {
  if (!canUsePreview(gate, options)) {
    return {
      ...gate,
      canPreview: false,
      previewLabel: '',
      previewMessage: ''
    };
  }

  return {
    ...gate,
    ...PREVIEW_META
  };
}

function evaluateCityGate({ city, name, rawStatus, coverage, internalPreview = false, previewCities = [] }) {
  const baseMeta = CITY_STATUS_META[rawStatus] || {
    status: 'not_open',
    label: '未开放',
    canSubmit: false,
    tone: 'disabled',
    message: '该城市暂未开放测算。'
  };

  if (rawStatus === 'ready' && !hasCompleteHistoricalCoverage(coverage)) {
    return applyPreviewMeta({
      city,
      name,
      rawStatus,
      ...HISTORY_BACKFILL_META
    }, { internalPreview, previewCities });
  }

  return applyPreviewMeta({
    city,
    name,
    rawStatus,
    ...baseMeta
  }, { internalPreview, previewCities });
}

function getCityGateOption(city, options = {}) {
  const current = getCityParam(city);
  if (!current) {
    return applyPreviewMeta({
      city,
      name: city,
      status: 'not_open',
      label: '未开放',
      canSubmit: false,
      tone: 'disabled',
      message: '该城市暂未开放测算。'
    }, options);
  }

  const coverage = cityHistoryCoverage.cities[city] || null;
  const gate = evaluateCityGate({
    city,
    name: current.name,
    rawStatus: current.status,
    coverage,
    internalPreview: options.internalPreview,
    previewCities: options.previewCities
  });

  return {
    ...gate,
    currentParam: getCityCurrentYearParam(city)
  };
}

function getCityGateOptions(options = {}) {
  return Object.keys(cityParams.cities).map((city) => getCityGateOption(city, options));
}

function canSubmitCity(city) {
  return getCityGateOption(city).canSubmit;
}

function canUseCachedEstimate(record, options = {}) {
  if (!record || !record.city) return false;

  const gate = getCityGateOption(record.city, options);
  const mode = record.releaseMode || record.mode || 'public';
  const previewCities = options.previewCities || [];

  if (mode === 'internal_preview' && options.internalPreview && previewCities.includes(record.city)) {
    return true;
  }

  if (gate.canSubmit) {
    const paidMonths = getPaidMonthsFromRecord(record);
    return paidMonths === null || isPaidHistorySupported({
      city: record.city,
      paidMonths,
      currentMonth: record.currentMonth
    });
  }

  return mode === 'internal_preview' && gate.canPreview;
}

function getDisabledCitySubmitLabel(options = {}) {
  const cityOptions = getCityGateOptions(options);
  if (cityOptions.some((option) => option.canSubmit)) return '立即测算';
  if (cityOptions.some((option) => option.canPreview)) return '开始试算';
  return '暂未开放测算';
}

function getBenchmarkGate(meta = benchmarkMeta, options = features) {
  const benchmarkReady =
    Boolean(meta.benchmarkVersion) &&
    meta.status === 'generated_reviewed' &&
    meta.sampleFileReady === true &&
    meta.cityParamsReviewed === true &&
    meta.amountSamplesVerified === true &&
    meta.reverseChecksPassed === true;
  const competitionEnabled = options.competitionEnabled === true;
  const enabled = competitionEnabled && benchmarkReady;
  const reason = enabled
    ? ''
    : (
      competitionEnabled
        ? '基准样本暂未开放'
        : '该功能暂未开放'
    );

  return {
    enabled,
    benchmarkVersion: meta.benchmarkVersion,
    reason,
    showCompetitionScore: enabled,
    showPercentile: enabled,
    showTrophy: enabled,
    showCompetitionShareCard: enabled
  };
}

module.exports = {
  canSubmitCity,
  canUseCachedEstimate,
  evaluateCityGate,
  getBenchmarkGate,
  getCityCurrentYearParam,
  getCityGateOption,
  getCityGateOptions,
  getDisabledCitySubmitLabel,
  getUnsupportedPaidHistoryYears,
  isPaidHistorySupported
};
