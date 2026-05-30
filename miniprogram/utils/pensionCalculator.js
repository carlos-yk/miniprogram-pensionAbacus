const { getBenchmarkGate, getCityCurrentYearParam, getCityGateOption } = require('./dataGate');
const { calculateRetirement, getRequiredContributionMonths } = require('./retirement');

const MONTHS_IN_YEAR = 12;
const CURRENT_MONTH = '2026-05';
const MISSING_FIELD_LABELS = {
  accountInterestRate: '个人账户记账利率',
  averageWage: '平均工资口径',
  flexibleContributionBase: '灵活就业缴费基数'
};

const REVIEW_STATUS_LABELS = {
  pending_second_review: '城市数据核对中',
  pending_city_applicability_review: '城市数据核对中',
  pending_review: '城市数据核对中',
  reviewed: '数据已核对',
  production_ready: '数据已达到上线门槛'
};

function monthIndex(value) {
  const [year, month] = value.split('-').map(Number);
  return year * 12 + (month - 1);
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

function buildWarnings(cityParam, personalAccountKnown, releaseMode) {
  const warnings = [
    '过渡性养老金暂未纳入；如果有较早工作经历或视同缴费，实际结果可能不同，可作为线下核定前参考。'
  ];

  if (releaseMode === 'internal_preview') {
    warnings.push('城市数据还在核对，当前结果仅供参考。');
  }

  const missingFields = (cityParam.dataQuality && cityParam.dataQuality.missingFields) || [];
  if (missingFields.length > 0) {
    warnings.push('部分参数仍在核对，当前结果为估算参考。');
  }

  if (!personalAccountKnown) {
    warnings.push('个人账户余额由系统估算，补充后结果范围会收窄。');
  }

  return warnings;
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
  const currentToRetirementMonths = Math.max(0, monthIndex(retirement.retirementMonth) - monthIndex(CURRENT_MONTH));
  const totalContributionMonths = Math.max(0, Number(input.paidMonths || 0)) + currentToRetirementMonths;
  const totalContributionYears = totalContributionMonths / MONTHS_IN_YEAR;
  const pensionBase = getFieldValue(cityParam.pensionCalculationBase, contribution.base);
  const requiredContributionMonths = getRequiredContributionMonths(retirement.retirementYear);
  const personalAccountKnown = Boolean(input.personalAccount && input.personalAccount.known);
  const personalRate = cityParam.rates.personalAccountCreditRate || cityParam.rates.employeePersonalRate || 0.08;
  const knownBalance = personalAccountKnown ? Number(input.personalAccount.balance || 0) : 0;
  const estimatedPastAccount = personalAccountKnown ? knownBalance : contribution.base * personalRate * Math.max(0, Number(input.paidMonths || 0));
  const futureAccount = contribution.base * personalRate * currentToRetirementMonths;
  const accountAtRetirement = estimatedPastAccount + futureAccount;
  const basicPension = pensionBase * (1 + contribution.index) / 2 * totalContributionYears * 0.01;
  const personalAccountPension = accountAtRetirement / retirement.payoutMonths;
  const monthlyTotal = basicPension + personalAccountPension;
  const rangeFactor = personalAccountKnown ? 0.15 : 0.25;
  const benchmarkGate = getBenchmarkGate();
  const releaseMode = input.mode === 'internal_preview' ? 'internal_preview' : 'public';

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
      averageIndex: Number(contribution.index.toFixed(2)),
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
      rangeLow: roundCurrency(monthlyTotal * (1 - rangeFactor)),
      rangeHigh: roundCurrency(monthlyTotal * (1 + rangeFactor))
    },
    breakdown: {
      basicPension: roundCurrency(basicPension),
      personalAccountPension: roundCurrency(personalAccountPension),
      transitionPension: {
        included: false,
        label: '暂未纳入'
      }
    },
    statusLabel: personalAccountKnown ? '账户余额已补充' : '快速估算',
    releaseMode,
    assumptions: [
      '未来按当前缴费水平持续到退休。',
      '个人账户按当前可用规则估算，不代表官方核定。',
      '实际养老金以当地社保经办机构核定为准。'
    ],
    dataQuality: buildDataQuality(cityParam),
    warnings: buildWarnings(cityParam, personalAccountKnown, releaseMode),
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
    statusLabel: input.personalAccount && input.personalAccount.known ? '账户余额已补充' : '快速估算',
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
  buildDefaultSharePayload,
  calculatePensionEstimate
};
