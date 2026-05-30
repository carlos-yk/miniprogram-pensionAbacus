const storage = require('../../utils/storage');
const { getCityGateOption } = require('../../utils/dataGate');

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

Page({
  data: {
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
    this.setData({
      hasLastResult: Boolean(lastResult),
      lastResultSummary: buildLastResultSummary(lastInput)
    });
  },

  onModuleTap(event) {
    const { key } = event.currentTarget.dataset;
    if (key === 'employee') {
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
    wx.navigateTo({ url: '/pages/calculate/calculate?scenario=family' });
  },

  openAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  }
});
