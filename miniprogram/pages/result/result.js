const { buildDefaultSharePayload } = require('../../utils/pensionCalculator');
const storage = require('../../utils/storage');

function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  return value.toLocaleString('zh-CN');
}

function buildViewModel(result) {
  if (!result) return null;

  const retirementText = result.retirement.isRange
    ? result.retirement.label
    : result.retirement.retirementAgeText;
  const retirementMonthText = result.retirement.isRange
    ? result.retirement.monthLabel
    : result.retirement.retirementMonth;
  const eligibilityClassName = result.eligibility.eligible ? 'eligibility ok' : 'eligibility risk';
  const canShare = result.releaseMode !== 'internal_preview';
  const missingText = result.dataQuality.missingFieldLabels && result.dataQuality.missingFieldLabels.length > 0
    ? result.dataQuality.missingFieldLabels.join('、')
    : '无关键缺失项';

  return {
    ...result,
    amountText: formatCurrency(result.amount.monthlyTotal),
    rangeText: `${formatCurrency(result.amount.rangeLow)} - ${formatCurrency(result.amount.rangeHigh)} 元/月`,
    basicText: `${formatCurrency(result.breakdown.basicPension)} 元/月`,
    accountText: `${formatCurrency(result.breakdown.personalAccountPension)} 元/月`,
    retirementText,
    retirementMonthText,
    canShare,
    eligibilityClassName,
    contributionYearsText: `${(result.contribution.totalMonths / 12).toFixed(1)} 年`,
    requiredContributionYearsText: `${(result.eligibility.requiredContributionMonths / 12).toFixed(1)} 年`,
    missingText,
    reviewStatusText: result.dataQuality.reviewStatusText || '数据仍在复核'
  };
}

Page({
  data: {
    result: null,
    scenario: 'self'
  },

  onLoad(options) {
    this.setData({
      scenario: options && options.scenario === 'family' ? 'family' : 'self'
    });
  },

  onShow() {
    const resultKey = this.data.scenario === 'family'
      ? storage.FAMILY_LAST_RESULT_KEY
      : storage.LAST_RESULT_KEY;
    const result = buildViewModel(storage.get(resultKey, null));

    if (result && result.canShare && wx.showShareMenu) {
      wx.showShareMenu();
    }
    if (result && !result.canShare && wx.hideShareMenu) {
      wx.hideShareMenu();
    }

    this.setData({
      result
    });
  },

  openAccount() {
    wx.navigateTo({ url: `/pages/account/account?from=result&scenario=${this.data.scenario}` });
  },

  openAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  },

  recalculate() {
    wx.navigateTo({ url: `/pages/calculate/calculate?scenario=${this.data.scenario}` });
  },

  onShareAppMessage() {
    return buildDefaultSharePayload(this.data.result);
  }
});
