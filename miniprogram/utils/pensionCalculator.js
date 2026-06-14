const {
  getBenchmarkGate,
  getCityCurrentYearParam,
  getCityGateOption,
  getPaidHistoryRisk
} = require('./dataGate');
const { calculateRetirement, getRequiredContributionMonths } = require('./retirement');
const { cityHistoryParams } = require('../data/runtime-data');
const features = require('../config/features');

const MONTHS_IN_YEAR = 12;
const MISSING_FIELD_LABELS = {
  accountInterestRate: '个人账户记账利率',
  averageWage: '平均工资口径',
  flexibleContributionBase: '灵活就业缴费基数'
};

const REVIEW_STATUS_LABELS = {
  pending_second_review: '该城市暂未开放测算',
  pending_city_applicability_review: '该城市暂未开放测算',
  pending_review: '该城市暂未开放测算',
  reviewed: '城市参数已完成基础校验',
  production_ready: '当前城市参数已可用于估算'
};

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundCurrency(value) {
  return Math.round(value);
}

function getFieldValue(field, fallback) {
  return field && typeof field.value === 'number' ? field.value : fallback;
}

function getCityName(city) {
  return getCityGateOption(city).name;
}

function resolveContributionIndex(contributionInput) {
  if (!contributionInput) return 0.6;
  if (contributionInput.type === 'ratio') return contributionInput.contributionIndex || 0.6;
  return null;
}

function resolveContributionBase(cityParam, contributionInput) {
  const employeeBase = cityParam.contributionBase.employee;
  const pensionBase = getFieldValue(cityParam.pensionCalculationBase, 8000);
  const averageWage = getFieldValue(cityParam.averageWage, pensionBase);
  const floor = employeeBase.floor || Math.round(averageWage * 0.6);
  const ceiling = employeeBase.ceiling || Math.round(averageWage * 3);

  if (!contributionInput || contributionInput.type === 'floor') {
    return { base: floor, index: floor / averageWage };
  }

  if (contributionInput.type === 'salary') {
    const base = clamp(Number(contributionInput.currentMonthlySalary) || floor, floor, ceiling);
    return { base, index: base / averageWage };
  }

  if (contributionInput.type === 'base') {
    const base = clamp(Number(contributionInput.monthlyContributionBase) || floor, floor, ceiling);
    return { base, index: base / averageWage };
  }

  const ratio = resolveContributionIndex(contributionInput) || 0.6;
  const base = clamp(Math.round(averageWage * ratio), floor, ceiling);
  return { base, index: ratio };
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

function getParamMonthIndex(value) {
  if (!value) return null;
  return monthIndex(value.slice(0, 7));
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

function getPersonalAccountCreditRateFromParam(yearParam, yearMonth) {
  const segments = yearParam && yearParam.rates && yearParam.rates.personalAccountCreditRateSegments;
  if (Array.isArray(segments) && yearMonth) {
    const targetMonthIndex = monthIndex(yearMonth);
    const segment = segments.find((item) => {
      const from = getParamMonthIndex(item.effectiveFrom);
      const to = getParamMonthIndex(item.effectiveTo);
      return from !== null && targetMonthIndex >= from && (to === null || targetMonthIndex <= to);
    });

    if (segment && typeof segment.personalAccountCreditRate === 'number') {
      return segment.personalAccountCreditRate;
    }
  }

  return yearParam.rates.personalAccountCreditRate || yearParam.rates.employeePersonalRate || 0.08;
}

function getPersonalAccountCreditRateForMonth(city, yearMonth, fallback) {
  const yearParam = getYearParamForMonth(city, yearMonth, fallback);
  if (!yearParam) return 0.08;
  return getPersonalAccountCreditRateFromParam(yearParam, yearMonth);
}

function buildYearContributionInput(contributionInput, currentContribution) {
  if (!contributionInput || contributionInput.type === 'floor') {
    return { type: 'floor' };
  }

  return {
    type: 'ratio',
    contributionIndex: currentContribution.index || 0.6
  };
}

function summarizeHistoricalContribution({
  city,
  paidMonths,
  currentMonth,
  contributionInput,
  currentContribution,
  currentParam
}) {
  const months = Math.max(0, Number(paidMonths || 0));
  if (months === 0) {
    return {
      account: 0,
      averageIndex: currentContribution.index,
      usedYearlyParams: false
    };
  }

  const currentMonthIndex = monthIndex(currentMonth);
  let account = 0;
  let totalIndex = 0;
  let usedYearlyParams = false;

  for (let offset = months; offset > 0; offset -= 1) {
    const paidMonthIndex = currentMonthIndex - offset;
    const paidMonth = monthFromIndex(paidMonthIndex);
    const yearParam = getYearParamForMonth(city, paidMonth, currentParam);
    const yearContribution = resolveContributionBase(
      yearParam,
      buildYearContributionInput(contributionInput, currentContribution)
    );
    const personalRate = getPersonalAccountCreditRateFromParam(yearParam, paidMonth);

    account += yearContribution.base * personalRate;
    totalIndex += yearContribution.index;
    if (yearParam.year !== currentParam.year) {
      usedYearlyParams = true;
    }
  }

  return {
    account,
    averageIndex: totalIndex / months,
    usedYearlyParams
  };
}

function buildWarnings(cityParam, personalAccountKnown, releaseMode) {
  const warnings = [
    '过渡性养老金暂未纳入；如果有较早工作经历或视同缴费，实际结果可能不同，可作为线下核定前参考。'
  ];

  if (releaseMode === 'internal_preview') {
    warnings.push('该城市数据还在核对，暂未开放测算；当前结果仅供参考。');
  }

  const missingFields = (cityParam.dataQuality && cityParam.dataQuality.missingFields) || [];
  if (missingFields.length > 0) {
    warnings.push('部分参数仍需人工确认，当前结果为估算参考。');
  }

  if (!personalAccountKnown) {
    warnings.push('个人账户余额由系统估算，补充后结果范围会收窄。');
  }

  return warnings;
}

function formatYearRange(years) {
  if (!years || years.length === 0) return '';
  const sorted = years.slice().sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let index = 1; index < sorted.length; index += 1) {
    const year = sorted[index];
    if (year === prev + 1) {
      prev = year;
      continue;
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = year;
    prev = year;
  }

  ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
  return ranges.join('、');
}

function buildDataQuality(cityParam) {
  const raw = cityParam.dataQuality || {};
  const reviewStatus = raw.reviewStatus || 'pending_review';
  const missingFields = raw.missingFields || [];
  const missingFieldLabels = missingFields.map((field) => MISSING_FIELD_LABELS[field] || field);

  return {
    level: raw.level || 'partial',
    reviewStatus,
    reviewStatusText: REVIEW_STATUS_LABELS[reviewStatus] || '城市数据核对中',
    missingFields,
    missingFieldLabels
  };
}

function calculateKnownWorkerEstimate(input) {
  const cityParam = getCityCurrentYearParam(input.city);
  if (!cityParam) {
    throw new Error(`Missing city params: ${input.city}`);
  }

  const retirement = calculateRetirement(input.workerType, input.birthMonth);
  const contribution = resolveContributionBase(cityParam, input.contributionInput);
  const currentMonth = input.currentMonth || features.calculationAsOfMonth;
  const currentToRetirementMonths = Math.max(0, monthIndex(retirement.retirementMonth) - monthIndex(currentMonth));
  const totalContributionMonths = Math.max(0, Number(input.paidMonths || 0)) + currentToRetirementMonths;
  const totalContributionYears = totalContributionMonths / MONTHS_IN_YEAR;
  const pensionBase = getFieldValue(cityParam.pensionCalculationBase, contribution.base);
  const requiredContributionMonths = getRequiredContributionMonths(retirement.retirementYear);
  const personalAccountKnown = Boolean(input.personalAccount && input.personalAccount.known);
  const personalRate = cityParam.rates.personalAccountCreditRate || cityParam.rates.employeePersonalRate || 0.08;
  const knownBalance = personalAccountKnown ? Number(input.personalAccount.balance || 0) : 0;
  const historicalContribution = summarizeHistoricalContribution({
    city: input.city,
    paidMonths: input.paidMonths,
    currentMonth,
    contributionInput: input.contributionInput,
    currentContribution: contribution,
    currentParam: cityParam
  });
  const estimatedPastAccount = personalAccountKnown ? knownBalance : historicalContribution.account;
  const futureAccount = contribution.base * personalRate * currentToRetirementMonths;
  const accountAtRetirement = estimatedPastAccount + futureAccount;
  const averageIndex = totalContributionMonths > 0
    ? (
      historicalContribution.averageIndex * Math.max(0, Number(input.paidMonths || 0)) +
      contribution.index * currentToRetirementMonths
    ) / totalContributionMonths
    : contribution.index;
  const basicPension = pensionBase * (1 + averageIndex) / 2 * totalContributionYears * 0.01;
  const personalAccountPension = accountAtRetirement / retirement.payoutMonths;
  const monthlyTotal = basicPension + personalAccountPension;
  const rangeFactor = personalAccountKnown ? 0.15 : 0.25;
  const historicalDataRisk = input.historicalDataRisk || getPaidHistoryRisk({
    city: input.city,
    paidMonths: input.paidMonths,
    currentMonth
  });
  const historicalRiskYearsText = formatYearRange(historicalDataRisk.softYears || historicalDataRisk.years || []);
  const finalRangeFactor = historicalDataRisk.hasRisk && !historicalDataRisk.blocking
    ? Math.max(rangeFactor, 0.35)
    : rangeFactor;
  const benchmarkGate = getBenchmarkGate();
  const releaseMode = input.mode === 'internal_preview' ? 'internal_preview' : 'public';
  const statusLabel = historicalDataRisk.hasRisk && !historicalDataRisk.blocking
    ? '含历史参数估算'
    : (personalAccountKnown ? '账户余额已补充' : '快速估算');
  const assumptions = [
    '未来按当前缴费水平持续到退休。',
    historicalContribution.usedYearlyParams
      ? '历史缴费已按当前可用年度参数分段估算，适合先看大概。'
      : '历史缴费按当前可用城市参数估算，适合先看大概。',
    '个人账户按当前可用规则估算，不代表官方核定。',
    '实际养老金以当地社保经办机构核定为准。'
  ];
  const warnings = buildWarnings(cityParam, personalAccountKnown, releaseMode);

  if (historicalDataRisk.hasRisk && !historicalDataRisk.blocking) {
    assumptions.splice(2, 0, `部分历史参数仍在核对，已按更宽区间估算 ${historicalRiskYearsText} 年影响。`);
    warnings.push(`${historicalRiskYearsText} 年部分个人账户记账利率仍在核对，本次结果已扩大估算范围。`);
  }

  return {
    city: input.city,
    cityName: getCityName(input.city),
    scenario: input.scenario || 'self',
    workerType: input.workerType,
    retirement: {
      isRange: false,
      ...retirement
    },
    contribution: {
      paidMonths: Number(input.paidMonths || 0),
      futureMonths: currentToRetirementMonths,
      totalMonths: totalContributionMonths,
      averageIndex: Number(averageIndex.toFixed(2)),
      monthlyBase: Math.round(contribution.base)
    },
    eligibility: {
      requiredContributionMonths,
      eligible: totalContributionMonths >= requiredContributionMonths,
      message: totalContributionMonths >= requiredContributionMonths
        ? '预计满足最低缴费年限要求。'
        : '当前缴费年限可能不足，可能需要继续缴费或延缴。'
    },
    amount: {
      monthlyTotal: roundCurrency(monthlyTotal),
      rangeLow: roundCurrency(monthlyTotal * (1 - finalRangeFactor)),
      rangeHigh: roundCurrency(monthlyTotal * (1 + finalRangeFactor))
    },
    breakdown: {
      basicPension: roundCurrency(basicPension),
      personalAccountPension: roundCurrency(personalAccountPension),
      transitionPension: {
        included: false,
        label: '暂未纳入'
      }
    },
    statusLabel,
    releaseMode,
    historicalDataRisk,
    assumptions,
    dataQuality: buildDataQuality(cityParam),
    warnings,
    competition: {
      visible: benchmarkGate.enabled,
      ...benchmarkGate
    }
  };
}

function combineUnknownFemaleEstimate(input) {
  const tracks = ['female_original_50', 'female_original_55'].map((workerType) =>
    calculateKnownWorkerEstimate({ ...input, workerType })
  );
  const low = Math.min(...tracks.map((track) => track.amount.rangeLow));
  const high = Math.max(...tracks.map((track) => track.amount.rangeHigh));
  const total = Math.round((tracks[0].amount.monthlyTotal + tracks[1].amount.monthlyTotal) / 2);

  return {
    ...tracks[0],
    workerType: 'female_unknown',
    retirement: {
      isRange: true,
      tracks: tracks.map((track) => track.retirement),
      label: `${tracks[0].retirement.retirementAgeText} - ${tracks[1].retirement.retirementAgeText}`,
      monthLabel: `${tracks[0].retirement.retirementMonth} - ${tracks[1].retirement.retirementMonth}`
    },
    amount: {
      monthlyTotal: total,
      rangeLow: low,
      rangeHigh: high
    },
    statusLabel: tracks[0].statusLabel,
    historicalDataRisk: tracks[0].historicalDataRisk,
    assumptions: [
      '退休类型可能影响退休时间和养老金金额，当前已按可能规则给出区间估算。',
      ...tracks[0].assumptions
    ],
    warnings: Array.from(new Set([
      '退休类型未确认，建议确认后重新测算以收窄范围。',
      ...tracks[0].warnings,
      ...tracks[1].warnings
    ]))
  };
}

function calculatePensionEstimate(input) {
  if (input.workerType === 'female_unknown') {
    return combineUnknownFemaleEstimate(input);
  }

  return calculateKnownWorkerEstimate(input);
}

function buildDefaultSharePayload() {
  return {
    title: '退休金算盘｜少填也能算，细填更准确',
    path: '/pages/home/home'
  };
}

module.exports = {
  _getPersonalAccountCreditRateForMonth: getPersonalAccountCreditRateForMonth,
  _getYearParamForMonth: getYearParamForMonth,
  buildDefaultSharePayload,
  calculatePensionEstimate
};
