const { buildDefaultSharePayload } = require('../../utils/pensionCalculator');
const storage = require('../../utils/storage');
const { canUseCachedEstimate } = require('../../utils/dataGate');
const features = require('../../config/features');

function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  return value.toLocaleString('zh-CN');
}

function buildExplainers(result) {
  const contributionYears = (result.contribution.totalMonths / 12).toFixed(1);
  const monthlyBase = formatCurrency(result.contribution.monthlyBase);
  const accountKnown = result.statusLabel === '账户余额已补充';

  return [
    `缴费年限按已填年限和预计退休月份合并估算，本次约 ${contributionYears} 年。`,
    `缴费水平按当前选择折算为月缴费基数约 ${monthlyBase} 元。`,
    accountKnown
      ? '个人账户养老金已使用你填写的账户余额。'
      : '个人账户余额暂按系统估算，补充余额后区间会收窄。'
  ];
}

function buildDataStatusText(result) {
  if (result.historicalDataRisk && result.historicalDataRisk.hasRisk) {
    return '含历史参数估算';
  }

  if (result.releaseMode === 'internal_preview') {
    return '城市数据还在核对';
  }

  return result.dataQuality.reviewStatusText || '城市数据已按当前规则估算';
}

function buildDataImpactText(result) {
  if (result.historicalDataRisk && result.historicalDataRisk.hasRisk) {
    return '部分历史年份参数仍在核对，当前结果已按更宽区间估算。';
  }

  const missingFields = result.dataQuality.missingFieldLabels || [];
  if (missingFields.length > 0 || result.releaseMode === 'internal_preview') {
    return '当前结果适合先看大概，补充个人账户余额后区间会更稳。';
  }

  return '当前使用已配置城市参数估算，结果仍以社保经办机构核定为准。';
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
    explainers: buildExplainers(result),
    dataStatusText: buildDataStatusText(result),
    dataImpactText: buildDataImpactText(result),
    contributionYearsText: `${(result.contribution.totalMonths / 12).toFixed(1)} 年`,
    requiredContributionYearsText: `${(result.eligibility.requiredContributionMonths / 12).toFixed(1)} 年`,
    missingText,
    reviewStatusText: result.dataQuality.reviewStatusText || '数据仍在复核'
  };
}

function getGateOptions() {
  return {
    internalPreview: features.internalPreviewEnabled,
    previewCities: features.previewCities
  };
}

function getStorageKeys(scenario) {
  if (scenario === 'family') {
    return {
      input: storage.FAMILY_LAST_INPUT_KEY,
      result: storage.FAMILY_LAST_RESULT_KEY
    };
  }

  return {
    input: storage.LAST_INPUT_KEY,
    result: storage.LAST_RESULT_KEY
  };
}

function clearEstimate(storageKeys) {
  storage.remove(storageKeys.input);
  storage.remove(storageKeys.result);
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
    const storageKeys = getStorageKeys(this.data.scenario);
    const cachedResult = storage.get(storageKeys.result, null);

    if (cachedResult && !canUseCachedEstimate(cachedResult, getGateOptions())) {
      clearEstimate(storageKeys);
      if (wx.hideShareMenu) {
        wx.hideShareMenu();
      }
      wx.showToast({ title: '该城市暂未开放测算', icon: 'none' });
      this.setData({ result: null });
      return;
    }

    const result = buildViewModel(cachedResult);

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
