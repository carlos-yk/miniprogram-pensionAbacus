const storage = require('../../utils/storage');
const { calculatePensionEstimate } = require('../../utils/pensionCalculator');

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

    storage.set(this.getAccountKey(this.data.scenario), value);
    this.recalculateLastResult(value);
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack({ delta: 1 });
    }, 350);
  },

  recalculateLastResult(value) {
    const lastInput = storage.get(this.getLastInputKey(this.data.scenario), null);
    if (!lastInput) return;

    const nextInput = {
      ...lastInput,
      personalAccount: {
        known: true,
        balance: value
      }
    };
    const result = calculatePensionEstimate(nextInput);
    storage.set(this.getLastInputKey(this.data.scenario), nextInput);
    storage.set(this.getLastResultKey(this.data.scenario), result);
  },

  skip() {
    wx.navigateBack({ delta: 1 });
  }
});
