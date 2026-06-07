const storage = require('../../utils/storage');
const { calculatePensionEstimate } = require('../../utils/pensionCalculator');
const { canUseCachedEstimate } = require('../../utils/dataGate');
const features = require('../../config/features');

const MAX_REASONABLE_ACCOUNT_BALANCE = 1000000;

function getGateOptions() {
  return {
    internalPreview: features.internalPreviewEnabled,
    previewCities: features.previewCities
  };
}

Page({
  data: {
    balance: '',
    error: '',
    from: '',
    scenario: 'self'
  },

  onLoad(options) {
    const scenario = options && options.scenario === 'family' ? 'family' : 'self';
    const saved = storage.get(this.getAccountKey(scenario), '');
    this.setData({
      balance: saved === null ? '' : String(saved),
      from: options && options.from ? options.from : '',
      scenario
    });
  },

  getAccountKey(scenario) {
    return scenario === 'family' ? storage.FAMILY_ACCOUNT_BALANCE_KEY : storage.ACCOUNT_BALANCE_KEY;
  },

  getLastInputKey(scenario) {
    return scenario === 'family' ? storage.FAMILY_LAST_INPUT_KEY : storage.LAST_INPUT_KEY;
  },

  getLastResultKey(scenario) {
    return scenario === 'family' ? storage.FAMILY_LAST_RESULT_KEY : storage.LAST_RESULT_KEY;
  },

  onInput(event) {
    this.setData({ balance: event.detail.value, error: '' });
  },

  save() {
    const value = Number(this.data.balance);
    if (!(value > 0)) {
      this.setData({ error: '请输入大于 0 的个人账户余额。' });
      wx.showToast({ title: '请输入个人账户余额', icon: 'none' });
      return;
    }
    if (value > MAX_REASONABLE_ACCOUNT_BALANCE) {
      const error = '个人账户余额看起来偏高，请核对是否多输入了 0。';
      this.setData({ error });
      wx.showToast({ title: error, icon: 'none' });
      return;
    }

    storage.set(this.getAccountKey(this.data.scenario), value);
    this.recalculateLastResult(value);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack({ delta: 1 });
    }, 350);
  },

  recalculateLastResult(value) {
    const lastInputKey = this.getLastInputKey(this.data.scenario);
    const lastResultKey = this.getLastResultKey(this.data.scenario);
    const lastInput = storage.get(lastInputKey, null);
    if (!lastInput) return;

    if (!canUseCachedEstimate(lastInput, getGateOptions())) {
      storage.remove(lastInputKey);
      storage.remove(lastResultKey);
      return;
    }

    const nextInput = {
      ...lastInput,
      personalAccount: {
        known: true,
        balance: value
      }
    };
    const result = calculatePensionEstimate(nextInput);
    storage.set(lastInputKey, nextInput);
    storage.set(lastResultKey, result);
  },

  skip() {
    wx.navigateBack({ delta: 1 });
  }
});
