const { retirementRules, payoutMonths } = require('../data/runtime-data');
const {
  addMonths,
  formatAge,
  getYear,
  monthsBetween,
  toMonthIndex
} = require('./date');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function findRule(workerType) {
  const rule = retirementRules.rules.find((item) => item.workerType === workerType);
  if (!rule) {
    throw new Error(`Unsupported worker type: ${workerType}`);
  }
  return rule;
}

function ageToMonths(age) {
  return age.years * 12 + age.months;
}

function calculateDelayMonths(rule, originalRetirementMonth) {
  if (toMonthIndex(originalRetirementMonth) < toMonthIndex('2025-01')) {
    return 0;
  }

  const elapsed = monthsBetween('2025-01', originalRetirementMonth);
  const delay = Math.floor(elapsed / rule.delayPolicy.stepMonths) + 1;
  return clamp(delay, 0, rule.delayPolicy.maxDelayMonths);
}

function calculateRetirement(workerType, birthMonth) {
  const rule = findRule(workerType);
  const originalAgeMonths = ageToMonths(rule.originalRetirementAge);
  const originalRetirementMonth = addMonths(birthMonth, originalAgeMonths);
  const delayMonths = calculateDelayMonths(rule, originalRetirementMonth);
  const retirementAgeTotalMonths = originalAgeMonths + delayMonths;
  const retirementMonth = addMonths(originalRetirementMonth, delayMonths);
  const payoutAgeYears = Math.floor(retirementAgeTotalMonths / 12);

  return {
    workerType,
    birthMonth,
    originalRetirementMonth,
    delayMonths,
    retirementMonth,
    retirementYear: getYear(retirementMonth),
    retirementAge: {
      years: Math.floor(retirementAgeTotalMonths / 12),
      months: retirementAgeTotalMonths % 12,
      totalMonths: retirementAgeTotalMonths
    },
    retirementAgeText: formatAge(retirementAgeTotalMonths),
    payoutAgeYears,
    payoutMonths: payoutMonths.monthsByRetirementAge[String(payoutAgeYears)]
  };
}

function getRequiredContributionMonths(retirementYear) {
  const matched = retirementRules.minimumContributionYearsByRetirementYear.find((item) => {
    const to = item.retirementYearTo || Number.POSITIVE_INFINITY;
    return retirementYear >= item.retirementYearFrom && retirementYear <= to;
  });

  if (!matched) {
    return 180;
  }

  return matched.requiredYears * 12 + matched.requiredMonths;
}

module.exports = {
  calculateRetirement,
  getRequiredContributionMonths
};
