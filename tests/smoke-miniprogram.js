const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const store = {};
const calls = {
  hideShareMenu: [],
  navigateTo: [],
  navigateBack: [],
  showShareMenu: [],
  showToast: []
};

global.setTimeout = (callback) => {
  callback();
  return 0;
};

global.wx = {
  navigateTo(options) {
    calls.navigateTo.push(options);
  },
  navigateBack(options) {
    calls.navigateBack.push(options);
  },
  showToast(options) {
    calls.showToast.push(options);
  },
  hideShareMenu(options) {
    calls.hideShareMenu.push(options);
  },
  showShareMenu(options) {
    calls.showShareMenu.push(options);
  },
  getStorageSync(key) {
    return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : '';
  },
  setStorageSync(key, value) {
    store[key] = value;
  },
  removeStorageSync(key) {
    delete store[key];
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resetCalls() {
  calls.navigateTo.length = 0;
  calls.navigateBack.length = 0;
  calls.showToast.length = 0;
  calls.hideShareMenu.length = 0;
  calls.showShareMenu.length = 0;
}

function loadPage(relativePath) {
  const fullPath = path.join(root, relativePath);
  delete require.cache[require.resolve(fullPath)];

  let definition = null;
  global.Page = (pageDefinition) => {
    definition = pageDefinition;
  };
  require(fullPath);
  delete global.Page;

  assert.ok(definition, `${relativePath} did not call Page()`);
  return {
    ...definition,
    data: clone(definition.data || {}),
    setData(nextData) {
      this.data = {
        ...this.data,
        ...nextData
      };
    }
  };
}

function tapDataset(dataset) {
  return {
    currentTarget: {
      dataset
    }
  };
}

function inputValue(value) {
  return {
    detail: {
      value
    }
  };
}

function runHomeSmoke() {
  resetCalls();
  const storage = require('../miniprogram/utils/storage');
  wx.setStorageSync(storage.LAST_RESULT_KEY, { amount: { monthlyTotal: 5200 } });
  wx.setStorageSync(storage.LAST_INPUT_KEY, {
    city: 'shanghai',
    workerType: 'male',
    paidMonths: 360
  });
  const page = loadPage('miniprogram/pages/home/home.js');
  page.onShow();

  assert.equal(page.data.hasLastResult, true);
  assert.match(page.data.lastResultSummary, /上海/);

  page.onModuleTap(tapDataset({ key: 'employee' }));
  assert.equal(calls.navigateTo.at(-1).url, '/pages/calculate/calculate');

  page.onModuleTap(tapDataset({ key: 'resident' }));
  assert.equal(calls.showToast.at(-1).title, '该模块正在规划中，敬请期待');

  page.openLastResult();
  assert.equal(calls.navigateTo.at(-1).url, '/pages/result/result');

  page.startFamilyEstimate();
  assert.equal(calls.navigateTo.at(-1).url, '/pages/calculate/calculate?scenario=family');
}

function runCalculateSmoke() {
  resetCalls();
  const page = loadPage('miniprogram/pages/calculate/calculate.js');
  page.onLoad({ scenario: 'family' });
  page.onShow();

  assert.equal(page.data.scenario, 'family');
  assert.equal(page.data.scenarioTitle, '正在帮家人测算');
  assert.equal(page.data.cityOptions.length, 3);
  assert.equal(page.data.submitLabel, '开始试算');
  assert.equal(page.data.visibleContributionOptions.some((item) => item.key === 'ratio_150'), false);
  page.toggleContributionOptions();
  assert.equal(page.data.visibleContributionOptions.some((item) => item.key === 'ratio_150'), true);

  page.onBirthMonthChange(inputValue('1968-06'));
  page.selectWorkerType(tapDataset({ key: 'male' }));
  page.selectCity(tapDataset({ city: 'shanghai' }));
  page.onPaidYearsInput(inputValue('30'));
  page.selectContribution(tapDataset({ key: 'ratio_150' }));
  page.onSubmitTap();

  assert.equal(calls.navigateTo.at(-1).url, '/pages/result/result?scenario=family');
  const storage = require('../miniprogram/utils/storage');
  assert.ok(wx.getStorageSync(storage.FAMILY_LAST_RESULT_KEY).amount.monthlyTotal > 0);
  assert.equal(wx.getStorageSync(storage.LAST_RESULT_KEY).amount.monthlyTotal, 5200);
}

function runResultSmoke() {
  resetCalls();
  const { calculatePensionEstimate, buildDefaultSharePayload } = require('../miniprogram/utils/pensionCalculator');
  const storage = require('../miniprogram/utils/storage');
  const result = calculatePensionEstimate({
    city: 'shanghai',
    workerType: 'female_unknown',
    birthMonth: '1978-06',
    paidMonths: 360,
    contributionInput: { type: 'ratio', contributionIndex: 1.5 },
    personalAccount: { known: false, balance: null },
    mode: 'internal_preview'
  });
  wx.setStorageSync(storage.LAST_RESULT_KEY, result);

  const page = loadPage('miniprogram/pages/result/result.js');
  page.onShow();
  assert.ok(page.data.result.retirementMonthText.includes(' - '));
  assert.equal(page.data.result.canShare, false);
  assert.equal(calls.hideShareMenu.length, 1);

  const share = page.onShareAppMessage();
  assert.deepEqual(share, buildDefaultSharePayload(page.data.result));
  assert.doesNotMatch(JSON.stringify(share), /1978|360|个人账户|缴费年限|元/);
}

function runAccountSmoke() {
  resetCalls();
  const storage = require('../miniprogram/utils/storage');
  wx.setStorageSync(storage.LAST_INPUT_KEY, {
    city: 'shanghai',
    workerType: 'male',
    birthMonth: '1968-06',
    paidMonths: 360,
    contributionInput: { type: 'ratio', contributionIndex: 1 },
    personalAccount: { known: false, balance: null }
  });

  const page = loadPage('miniprogram/pages/account/account.js');
  page.onLoad({});
  page.onInput(inputValue('180000'));
  page.save();

  assert.equal(wx.getStorageSync(storage.ACCOUNT_BALANCE_KEY), 180000);
  assert.ok(wx.getStorageSync(storage.LAST_RESULT_KEY).amount.monthlyTotal > 0);
  assert.equal(calls.navigateBack.length, 1);
}

runHomeSmoke();
runCalculateSmoke();
runResultSmoke();
runAccountSmoke();

console.log('OK mini program page smoke interactions');
