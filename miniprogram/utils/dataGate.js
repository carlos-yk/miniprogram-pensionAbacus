const {
  cityParams,
  cityHistoryParams,
  cityHistoryCoverage,
  benchmarkMeta
} = require('../data/runtime-data');

const CITY_STATUS_META = {
  partial_pending_second_review: {
    status: 'data_reviewing',
    label: '暂未开放',
    canSubmit: false,
    tone: 'warning',
    message: '该城市暂未开放普通测算。'
  },
  partial_pending_city_applicability_review: {
    status: 'history_backfilling',
    label: '暂未开放',
    canSubmit: false,
    tone: 'warning',
    message: '该城市暂未开放普通测算。'
  },
  ready: {
    status: 'ready',
    label: '可测算',
    canSubmit: true,
    tone: 'success',
    message: ''
  }
};

const HISTORY_BACKFILL_META = {
  status: 'history_backfilling',
  label: '暂未开放',
  canSubmit: false,
  tone: 'warning',
  message: '该城市暂未开放普通测算。'
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

function hasCompleteHistoricalCoverage(coverage) {
  if (!coverage) return false;
  const officialYears = coverage.officialCompleteYears || [];
  const partialYears = coverage.partialYears || [];
  const missingYears = coverage.missingYears || [];

  return officialYears.length > 0 && partialYears.length === 0 && missingYears.length === 0;
}

function applyPreviewMeta(gate, options = {}) {
  if (!options.internalPreview || gate.canSubmit) {
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

function evaluateCityGate({ city, name, rawStatus, coverage, internalPreview = false }) {
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
    }, { internalPreview });
  }

  return applyPreviewMeta({
    city,
    name,
    rawStatus,
    ...baseMeta
  }, { internalPreview });
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
    internalPreview: options.internalPreview
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

function getDisabledCitySubmitLabel(options = {}) {
  const cityOptions = getCityGateOptions(options);
  if (cityOptions.some((option) => option.canSubmit)) return '立即测算';
  if (cityOptions.some((option) => option.canPreview)) return '开始试算';
  return '暂未开放测算';
}

function getBenchmarkGate() {
  const enabled =
    Boolean(benchmarkMeta.benchmarkVersion) &&
    benchmarkMeta.status === 'generated_reviewed' &&
    benchmarkMeta.sampleFileReady === true &&
    benchmarkMeta.cityParamsReviewed === true &&
    benchmarkMeta.amountSamplesVerified === true &&
    benchmarkMeta.reverseChecksPassed === true;

  return {
    enabled,
    benchmarkVersion: benchmarkMeta.benchmarkVersion,
    reason: enabled ? '' : benchmarkMeta.reason || 'benchmark 样本未达到上线门槛',
    showCompetitionScore: enabled,
    showPercentile: enabled,
    showTrophy: enabled,
    showCompetitionShareCard: enabled
  };
}

module.exports = {
  canSubmitCity,
  evaluateCityGate,
  getBenchmarkGate,
  getCityCurrentYearParam,
  getCityGateOption,
  getCityGateOptions,
  getDisabledCitySubmitLabel
};
