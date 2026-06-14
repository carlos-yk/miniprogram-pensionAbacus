const {
  getCityGateOptions,
  getDisabledCitySubmitLabel,
  getPaidHistoryRisk
} = require('../../utils/dataGate');
const { calculatePensionEstimate } = require('../../utils/pensionCalculator');
const { calculateRetirement } = require('../../utils/retirement');
const { toMonthIndex } = require('../../utils/date');
const {
  getAdvancedContributionOptions,
  getContributionOptions,
  getPrimaryContributionOptions,
  getWorkerTypes
} = require('../../utils/formOptions');
const storage = require('../../utils/storage');
const features = require('../../config/features');

const workerTypes = getWorkerTypes();
const contributionOptions = getContributionOptions();
const primaryContributionOptions = getPrimaryContributionOptions();
const advancedContributionOptions = getAdvancedContributionOptions();
const MAX_REASONABLE_PAID_YEARS = 50;
const RETIRED_GRACE_MONTHS = 12;

function decorateWorkerTypes(selectedKey) {
  return workerTypes.map((item) => ({
    ...item,
    selected: selectedKey === item.key,
    className: selectedKey === item.key ? 'option-card selected' : 'option-card'
  }));
}

function decorateContributionOptions(options, selectedKey) {
  return options.map((item) => ({
    ...item,
    selected: selectedKey === item.key,
    className: selectedKey === item.key ? 'contribution-card selected' : 'contribution-card'
  }));
}

function isAdvancedContributionKey(key) {
  return advancedContributionOptions.some((item) => item.key === key);
}

function buildVisibleContributionOptions(selectedKey, showAdvanced) {
  const options = showAdvanced || isAdvancedContributionKey(selectedKey)
    ? primaryContributionOptions.concat(advancedContributionOptions)
    : primaryContributionOptions;
  return decorateContributionOptions(options, selectedKey);
}

function decorateCityOptions(options, selectedCity) {
  return options.map((item) => ({
    ...item,
    selected: selectedCity === item.city,
    className: [
      'city-card',
      selectedCity === item.city ? 'selected' : '',
      item.canSubmit ? '' : 'blocked'
    ].filter(Boolean).join(' '),
    tagClassName: `tag ${item.tone}`,
    displayMessage: item.canPreview ? item.previewMessage : (item.message || '当前城市参数已达到测算门槛')
  }));
}

function canEstimateCity(option) {
  return Boolean(option && (option.canSubmit || option.canPreview));
}

function getWorkerTypeTracks(workerType) {
  if (workerType === 'female_unknown') {
    return ['female_original_50', 'female_original_55'];
  }

  return [workerType];
}

function getRetirementScopeError(workerType, birthMonth) {
  if (!workerType || !birthMonth) return '';

  const currentMonthIndex = toMonthIndex(features.calculationAsOfMonth);
  const retirementMonthIndexes = getWorkerTypeTracks(workerType).map((track) =>
    toMonthIndex(calculateRetirement(track, birthMonth).retirementMonth)
  );
  const latestRetirementMonth = Math.max(...retirementMonthIndexes);

  if (latestRetirementMonth < currentMonthIndex - RETIRED_GRACE_MONTHS) {
    return '这个工具更适合估算未退休或刚接近退休的情况，已退休人员建议直接查询实际待遇。';
  }

  return '';
}

function getInputBoundaryError({ birthMonth, workerType, paidYears }) {
  if (birthMonth && toMonthIndex(birthMonth) > toMonthIndex(features.calculationAsOfMonth)) {
    return '出生年月不能晚于当前测算月份。';
  }

  if (Number(paidYears) > MAX_REASONABLE_PAID_YEARS) {
    return '已缴费年限看起来偏高，请核对后再测算。';
  }

  return getRetirementScopeError(workerType, birthMonth);
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

function getHistorySupportError(city, paidYears) {
  if (!city || !(Number(paidYears) > 0)) return '';

  const historyRisk = getPaidHistoryRisk({
    city,
    paidMonths: Math.round(Number(paidYears) * 12)
  });
  if (!historyRisk.blocking) return '';

  return `这组缴费年限会用到 ${formatYearRange(historyRisk.blockingYears)} 年核心历史参数，数据还在核对，暂未开放这组测算。`;
}

function getHistoricalDataRisk(city, paidYears) {
  if (!city || !(Number(paidYears) > 0)) {
    return {
      hasRisk: false,
      blocking: false,
      softYears: [],
      blockingYears: [],
      years: [],
      message: ''
    };
  }

  return getPaidHistoryRisk({
    city,
    paidMonths: Math.round(Number(paidYears) * 12)
  });
}

function getScenarioCopy(scenario) {
  if (scenario === 'family') {
    return {
      scenario,
      scenarioTitle: '正在帮家人测算',
      scenarioDesc: '本次结果会单独保存，不会覆盖你的最近一次测算。',
      showScenarioBanner: true
    };
  }

  return {
    scenario: 'self',
    scenarioTitle: '',
    scenarioDesc: '',
    showScenarioBanner: false
  };
}

function getStorageKeys(scenario) {
  if (scenario === 'family') {
    return {
      input: storage.FAMILY_LAST_INPUT_KEY,
      result: storage.FAMILY_LAST_RESULT_KEY,
      account: storage.FAMILY_ACCOUNT_BALANCE_KEY
    };
  }

  return {
    input: storage.LAST_INPUT_KEY,
    result: storage.LAST_RESULT_KEY,
    account: storage.ACCOUNT_BALANCE_KEY
  };
}

Page({
  data: {
    workerTypes: decorateWorkerTypes(''),
    contributionOptions: decorateContributionOptions(contributionOptions, ''),
    visibleContributionOptions: buildVisibleContributionOptions('', false),
    showAdvancedContributionOptions: false,
    advancedContributionToggleText: '更多缴费档位',
    cityOptions: [],
    scenario: 'self',
    scenarioTitle: '',
    scenarioDesc: '',
    showScenarioBanner: false,
    birthMonth: '',
    birthMonthLabel: '请选择出生年月',
    workerType: '',
    showFemaleUnknownHint: false,
    city: '',
    paidYears: '',
    selectedContributionKey: '',
    contributionAmount: '',
    showAmountInput: false,
    amountPlaceholder: '',
    cityMessage: '',
    formError: '',
    submitLabel: '立即测算',
    submitClassName: 'primary-button disabled',
    canSubmit: false,
    hasAccountBalance: false,
    accountBalance: null,
    accountHint: '不知道也可以跳过，结果范围会更宽'
  },

  onLoad(options) {
    this.setData(getScenarioCopy(options && options.scenario));
  },

  onShow() {
    const storageKeys = getStorageKeys(this.data.scenario);
    const accountBalance = storage.get(storageKeys.account, null);
    const cityOptions = getCityGateOptions({
      internalPreview: features.internalPreviewEnabled,
      previewCities: features.previewCities
    });
    this.setData({
      cityOptions: decorateCityOptions(cityOptions, this.data.city),
      submitLabel: getDisabledCitySubmitLabel({
        internalPreview: features.internalPreviewEnabled,
        previewCities: features.previewCities
      }),
      hasAccountBalance: accountBalance !== null && accountBalance !== '',
      accountBalance,
      accountHint: accountBalance !== null && accountBalance !== ''
        ? '已填写个人账户余额，可用于重算'
        : '不知道也可以跳过，结果范围会更宽'
    });
    this.updateSubmitState();
  },

  onBirthMonthChange(event) {
    this.setData({
      birthMonth: event.detail.value,
      birthMonthLabel: event.detail.value || '请选择出生年月',
      formError: ''
    });
    this.updateSubmitState();
  },

  selectWorkerType(event) {
    const workerType = event.currentTarget.dataset.key;
    this.setData({
      workerType,
      workerTypes: decorateWorkerTypes(workerType),
      showFemaleUnknownHint: workerType === 'female_unknown',
      formError: ''
    });
    this.updateSubmitState();
  },

  selectCity(event) {
    const city = event.currentTarget.dataset.city;
    const option = this.data.cityOptions.find((item) => item.city === city);
    const cityOptions = getCityGateOptions({
      internalPreview: features.internalPreviewEnabled,
      previewCities: features.previewCities
    });
    const message = option && option.canPreview ? option.previewMessage : (option ? option.message : '');
    this.setData({
      city,
      cityOptions: decorateCityOptions(cityOptions, city),
      cityMessage: option && !option.canSubmit ? message : '',
      formError: ''
    });

    if (option && !option.canSubmit) {
      wx.showToast({ title: message, icon: 'none' });
    }

    this.updateSubmitState();
  },

  selectContribution(event) {
    const key = event.currentTarget.dataset.key;
    const selected = contributionOptions.find((item) => item.key === key);
    const showAdvanced = this.data.showAdvancedContributionOptions || isAdvancedContributionKey(key);
    this.setData({
      selectedContributionKey: key,
      contributionOptions: decorateContributionOptions(contributionOptions, key),
      visibleContributionOptions: buildVisibleContributionOptions(key, showAdvanced),
      showAdvancedContributionOptions: showAdvanced,
      advancedContributionToggleText: showAdvanced ? '收起缴费档位' : '更多缴费档位',
      contributionAmount: '',
      showAmountInput: Boolean(selected && selected.needsAmount),
      amountPlaceholder: selected && selected.amountPlaceholder ? selected.amountPlaceholder : '',
      formError: ''
    });
    this.updateSubmitState();
  },

  toggleContributionOptions() {
    const showAdvanced = !this.data.showAdvancedContributionOptions;
    this.setData({
      showAdvancedContributionOptions: showAdvanced,
      advancedContributionToggleText: showAdvanced ? '收起缴费档位' : '更多缴费档位',
      visibleContributionOptions: buildVisibleContributionOptions(this.data.selectedContributionKey, showAdvanced)
    });
  },

  onContributionAmountInput(event) {
    this.setData({ contributionAmount: event.detail.value, formError: '' });
    this.updateSubmitState();
  },

  onPaidYearsInput(event) {
    this.setData({ paidYears: event.detail.value, formError: '' });
    this.updateSubmitState();
  },

  updateSubmitState() {
    const selectedCity = this.data.cityOptions.find((item) => item.city === this.data.city);
    const contribution = this.getSelectedContribution();
    const needsAmount = contribution && contribution.needsAmount;
    const hasAmount = !needsAmount || Number(this.data.contributionAmount) > 0;
    const boundaryError = getInputBoundaryError({
      birthMonth: this.data.birthMonth,
      workerType: this.data.workerType,
      paidYears: this.data.paidYears
    });
    const historySupportError = selectedCity && selectedCity.canSubmit
      ? getHistorySupportError(this.data.city, this.data.paidYears)
      : '';
    const canSubmit = Boolean(
      this.data.birthMonth &&
      this.data.workerType &&
      selectedCity &&
      canEstimateCity(selectedCity) &&
      Number(this.data.paidYears) > 0 &&
      contribution &&
      hasAmount &&
      !boundaryError &&
      !historySupportError
    );

    this.setData({
      canSubmit,
      submitClassName: canSubmit ? 'primary-button' : 'primary-button disabled',
      submitLabel: selectedCity
        ? (selectedCity.canSubmit ? '立即测算' : (selectedCity.canPreview ? '开始试算' : '暂未开放测算'))
        : getDisabledCitySubmitLabel({
          internalPreview: features.internalPreviewEnabled,
          previewCities: features.previewCities
        })
    });
  },

  getSelectedContribution() {
    return contributionOptions.find((item) => item.key === this.data.selectedContributionKey) || null;
  },

  buildContributionInput() {
    const option = this.getSelectedContribution();
    if (!option) return null;

    if (!option.needsAmount) {
      return option.input;
    }

    const amount = Number(this.data.contributionAmount);
    if (option.inputType === 'salary') {
      return { type: 'salary', currentMonthlySalary: amount };
    }

    return { type: 'base', monthlyContributionBase: amount };
  },

  validate() {
    const selectedCity = this.data.cityOptions.find((item) => item.city === this.data.city);
    if (!this.data.birthMonth) return '请选择出生年月。';
    if (toMonthIndex(this.data.birthMonth) > toMonthIndex(features.calculationAsOfMonth)) {
      return '出生年月不能晚于当前测算月份。';
    }
    if (!this.data.workerType) return '请选择性别 / 退休类型。';
    if (!selectedCity) return '请选择预计退休城市。';
    if (!canEstimateCity(selectedCity)) return selectedCity.message;
    if (!(Number(this.data.paidYears) > 0)) return '请填写已缴费年限。';
    if (Number(this.data.paidYears) > MAX_REASONABLE_PAID_YEARS) {
      return '已缴费年限看起来偏高，请核对后再测算。';
    }
    const retirementScopeError = getRetirementScopeError(this.data.workerType, this.data.birthMonth);
    if (retirementScopeError) return retirementScopeError;
    if (selectedCity.canSubmit) {
      const historySupportError = getHistorySupportError(this.data.city, this.data.paidYears);
      if (historySupportError) return historySupportError;
    }
    if (!this.getSelectedContribution()) return '请选择当前缴费水平。';
    if (this.getSelectedContribution().needsAmount && !(Number(this.data.contributionAmount) > 0)) {
      return '请补充金额后再测算。';
    }
    return '';
  },

  submit() {
    const error = this.validate();
    if (error) {
      this.setData({ formError: error });
      wx.showToast({ title: error, icon: 'none' });
      return;
    }

    const historyRisk = getHistoricalDataRisk(this.data.city, this.data.paidYears);
    const selectedCity = this.data.cityOptions.find((item) => item.city === this.data.city);
    const input = {
      city: this.data.city,
      workerType: this.data.workerType,
      birthMonth: this.data.birthMonth,
      paidMonths: Math.round(Number(this.data.paidYears) * 12),
      contributionInput: this.buildContributionInput(),
      scenario: this.data.scenario,
      mode: selectedCity.canPreview && !selectedCity.canSubmit ? 'internal_preview' : 'public',
      personalAccount: {
        known: this.data.hasAccountBalance,
        balance: this.data.hasAccountBalance ? Number(this.data.accountBalance) : null
      },
      historicalDataRisk: historyRisk.hasRisk && !historyRisk.blocking ? historyRisk : null
    };

    const result = calculatePensionEstimate(input);
    const storageKeys = getStorageKeys(this.data.scenario);
    storage.set(storageKeys.input, input);
    storage.set(storageKeys.result, result);
    wx.navigateTo({ url: `/pages/result/result?scenario=${this.data.scenario}` });
  },

  onSubmitTap() {
    if (!this.data.canSubmit) {
      const error = this.validate();
      const message = error || this.data.cityMessage || '请先补全信息后再测算。';
      this.setData({ formError: message });
      wx.showToast({ title: message, icon: 'none' });
      return;
    }

    const historyRisk = getHistoricalDataRisk(this.data.city, this.data.paidYears);
    if (historyRisk.hasRisk && !historyRisk.blocking && wx.showModal) {
      wx.showModal({
        title: '历史参数仍在核对',
        content: `本次会用到 ${formatYearRange(historyRisk.softYears)} 年部分历史参数，结果会按更宽区间估算，仅供参考。`,
        confirmText: '继续估算',
        cancelText: '返回调整',
        success: (res) => {
          if (res.confirm) {
            this.submit();
          }
        }
      });
      return;
    }

    this.submit();
  },

  openAccount() {
    wx.navigateTo({ url: `/pages/account/account?scenario=${this.data.scenario}` });
  },

  openAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  }
});
