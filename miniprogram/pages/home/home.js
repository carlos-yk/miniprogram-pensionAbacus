const storage = require('../../utils/storage');
const { canUseCachedEstimate, getCityGateOption, getCityGateOptions } = require('../../utils/dataGate');
const features = require('../../config/features');

const WORKER_TYPE_LABELS = {
  male: '男性',
  female_original_55: '女性约55岁退休',
  female_original_50: '女性约50岁退休',
  female_unknown: '女性退休类型待确认'
};

function buildLastResultSummary(input) {
  if (!input) return '查看最近一次结果，或补充账户余额后重算';

  const cityName = input.city ? getCityGateOption(input.city).name : '上次城市';
  const workerText = WORKER_TYPE_LABELS[input.workerType] || '已选退休类型';
  const years = input.paidMonths ? `${Math.round(input.paidMonths / 12)} 年缴费` : '已填缴费年限';
  return `上次：${cityName} / ${workerText} / ${years}`;
}

function getGateOptions() {
  return {
    internalPreview: features.internalPreviewEnabled,
    previewCities: features.previewCities
  };
}

function isLastResultUsable(lastResult, lastInput) {
  const options = getGateOptions();
  return Boolean(
    lastResult &&
    canUseCachedEstimate(lastResult, options) &&
    (!lastInput || canUseCachedEstimate(lastInput, options))
  );
}

function clearLastEstimate() {
  storage.remove(storage.LAST_RESULT_KEY);
  storage.remove(storage.LAST_INPUT_KEY);
}

function canStartEmployeeEstimate() {
  return getCityGateOptions(getGateOptions()).some((option) => option.canSubmit || option.canPreview);
}

Page({
  data: {
    employeeActionText: '开始',
    employeeModuleAvailable: true,
    primaryModuleDesc: '约 30 秒完成快速估算',
    familyActionDesc: '用同一流程为父母或伴侣先算个大概',
    hasLastResult: false,
    lastResultSummary: '查看最近一次结果，或补充账户余额后重算',
    futureModules: [
      { key: 'institution', title: '机关事业养老金测算', desc: '敬请期待', available: false },
      { key: 'resident', title: '城乡居民养老金测算', desc: '敬请期待', available: false },
      { key: 'enterprise_annuity', title: '企业年金测算', desc: '敬请期待', available: false },
      { key: 'occupational_annuity', title: '职业年金测算', desc: '敬请期待', available: false },
      { key: 'personal_pension', title: '个人养老金测算', desc: '敬请期待', available: false }
    ]
  },

  onShow() {
    const lastResult = storage.get(storage.LAST_RESULT_KEY, null);
    const lastInput = storage.get(storage.LAST_INPUT_KEY, null);
    const hasUsableLastResult = isLastResultUsable(lastResult, lastInput);

    if ((lastResult || lastInput) && !hasUsableLastResult) {
      clearLastEstimate();
    }

    const employeeModuleAvailable = canStartEmployeeEstimate();

    this.setData({
      employeeActionText: employeeModuleAvailable ? '开始' : '查看进度',
      employeeModuleAvailable,
      primaryModuleDesc: employeeModuleAvailable ? '约 30 秒完成快速估算' : '城市开放后可测算',
      familyActionDesc: employeeModuleAvailable
        ? '用同一流程为父母或伴侣先算个大概'
        : '城市开放后可帮家人测算',
      hasLastResult: hasUsableLastResult,
      lastResultSummary: hasUsableLastResult
        ? buildLastResultSummary(lastInput)
        : '查看最近一次结果，或补充账户余额后重算'
    });
  },

  onModuleTap(event) {
    const { key } = event.currentTarget.dataset;
    if (key === 'employee') {
      if (!this.data.employeeModuleAvailable) {
        wx.navigateTo({ url: '/pages/about/about' });
        return;
      }

      wx.navigateTo({ url: '/pages/calculate/calculate' });
      return;
    }

    wx.showToast({
      title: '该模块正在规划中，敬请期待',
      icon: 'none'
    });
  },

  openLastResult() {
    wx.navigateTo({ url: '/pages/result/result' });
  },

  startFamilyEstimate() {
    if (!this.data.employeeModuleAvailable) {
      wx.navigateTo({ url: '/pages/about/about' });
      return;
    }

    wx.navigateTo({ url: '/pages/calculate/calculate?scenario=family' });
  },

  openAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  }
});
