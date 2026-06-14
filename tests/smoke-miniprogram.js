const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const store = {};
const calls = {
  hideShareMenu: [],
  navigateTo: [],
  navigateBack: [],
  showModal: [],
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
  showModal(options) {
    calls.showModal.push(options);
    if (options && typeof options.success === 'function') {
      options.success({ confirm: true, cancel: false });
    }
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

function resetStore() {
  for (const key of Object.keys(store)) {
    delete store[key];
  }
}

function resetCalls() {
  calls.navigateTo.length = 0;
  calls.navigateBack.length = 0;
  calls.showToast.length = 0;
  calls.showModal.length = 0;
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
  resetStore();
  resetCalls();
  const storage = require('../miniprogram/utils/storage');
  wx.setStorageSync(storage.LAST_RESULT_KEY, {
    city: 'shanghai',
    releaseMode: 'public',
    amount: { monthlyTotal: 5200 }
  });
  wx.setStorageSync(storage.LAST_INPUT_KEY, {
    city: 'shanghai',
    workerType: 'male',
    paidMonths: 360,
    mode: 'public'
  });
  const page = loadPage('miniprogram/pages/home/home.js');
  page.onShow();

  assert.equal(page.data.hasLastResult, false);
  assert.equal(wx.getStorageSync(storage.LAST_RESULT_KEY), '');
  assert.equal(wx.getStorageSync(storage.LAST_INPUT_KEY), '');
  assert.equal(page.data.employeeActionText, '开始');
  assert.equal(page.data.employeeModuleAvailable, true);
  assert.equal(page.data.familyActionDesc, '用同一流程为父母或伴侣先算个大概');

  page.onModuleTap(tapDataset({ key: 'employee' }));
  assert.equal(calls.navigateTo.at(-1).url, '/pages/calculate/calculate');

  page.onModuleTap(tapDataset({ key: 'resident' }));
  assert.equal(calls.showToast.at(-1).title, '该模块正在规划中，敬请期待');

  page.startFamilyEstimate();
  assert.equal(calls.navigateTo.at(-1).url, '/pages/calculate/calculate?scenario=family');
}

function runCalculateSmoke() {
  resetStore();
  resetCalls();
  const page = loadPage('miniprogram/pages/calculate/calculate.js');
  page.onLoad({ scenario: 'family' });
  page.onShow();

  assert.equal(page.data.scenario, 'family');
  assert.equal(page.data.scenarioTitle, '正在帮家人测算');
  assert.equal(page.data.cityOptions.length, 3);
  assert.equal(page.data.submitLabel, '立即测算');
  assert.equal(page.data.birthMonth, '');
  assert.equal(page.data.birthMonthLabel, '请选择出生年月');
  assert.equal(page.data.birthMonthPickerValue, '1973-05');
  assert.equal(page.data.birthMonthStart, '1940-01');
  assert.equal(page.data.birthMonthEnd, '2026-05');
  assert.equal(page.data.visibleContributionOptions.some((item) => item.key === 'ratio_150'), false);
  page.toggleContributionOptions();
  assert.equal(page.data.visibleContributionOptions.some((item) => item.key === 'ratio_150'), true);

  page.selectWorkerType(tapDataset({ key: 'male' }));
  assert.equal(page.data.birthMonthPickerValue, '1968-05');
  assert.equal(page.data.birthMonth, '');

  page.onBirthMonthChange(inputValue('1968-06'));
  page.selectWorkerType(tapDataset({ key: 'male' }));
  page.selectCity(tapDataset({ city: 'shanghai' }));
  page.onPaidYearsInput(inputValue('20'));
  page.selectContribution(tapDataset({ key: 'ratio_150' }));
  page.onSubmitTap();

  const storage = require('../miniprogram/utils/storage');
  assert.match(calls.showModal.at(-1).content, /2006-2007、2013/);
  assert.equal(calls.navigateTo.at(-1).url, '/pages/result/result?scenario=family');
  assert.notEqual(wx.getStorageSync(storage.FAMILY_LAST_RESULT_KEY), '');
  assert.match(wx.getStorageSync(storage.FAMILY_LAST_RESULT_KEY).statusLabel, /历史参数/);
  assert.equal(wx.getStorageSync(storage.LAST_RESULT_KEY), '');

  page.onPaidYearsInput(inputValue('10'));
  page.onSubmitTap();

  assert.equal(calls.navigateTo.at(-1).url, '/pages/result/result?scenario=family');
  assert.notEqual(wx.getStorageSync(storage.FAMILY_LAST_RESULT_KEY), '');

  const femalePage = loadPage('miniprogram/pages/calculate/calculate.js');
  femalePage.selectWorkerType(tapDataset({ key: 'female_original_50' }));
  assert.equal(femalePage.data.birthMonthPickerValue, '1978-05');
  femalePage.onBirthMonthChange(inputValue('1977-01'));
  femalePage.selectWorkerType(tapDataset({ key: 'male' }));
  assert.equal(femalePage.data.birthMonthPickerValue, '1977-01');
}

function runCalculateValidationSmoke() {
  resetStore();
  resetCalls();
  const page = loadPage('miniprogram/pages/calculate/calculate.js');
  page.onLoad({});
  page.setData({
    cityOptions: [
      {
        city: 'shanghai',
        name: '上海',
        canSubmit: true,
        canPreview: false,
        message: ''
      }
    ],
    birthMonth: '2099-01',
    birthMonthLabel: '2099-01',
    workerType: 'male',
    city: 'shanghai',
    paidYears: '30',
    selectedContributionKey: 'ratio_100',
    contributionAmount: ''
  });

  assert.equal(page.validate(), '出生年月不能晚于当前测算月份。');

  page.setData({
    birthMonth: '1980-01',
    birthMonthLabel: '1980-01',
    paidYears: '80'
  });

  assert.equal(page.validate(), '已缴费年限看起来偏高，请核对后再测算。');

  page.setData({
    birthMonth: '1940-01',
    birthMonthLabel: '1940-01',
    paidYears: '40'
  });

  assert.equal(page.validate(), '这个工具更适合估算未退休或刚接近退休的情况，已退休人员建议直接查询实际待遇。');
}

function runResultSmoke() {
  resetStore();
  resetCalls();
  const { calculatePensionEstimate, buildDefaultSharePayload } = require('../miniprogram/utils/pensionCalculator');
  const features = require('../miniprogram/config/features');
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

  features.internalPreviewEnabled = true;
  const page = loadPage('miniprogram/pages/result/result.js');
  try {
    page.onShow();
  } finally {
    features.internalPreviewEnabled = false;
  }

  assert.ok(page.data.result.retirementMonthText.includes(' - '));
  assert.equal(page.data.result.canShare, false);
  assert.equal(calls.hideShareMenu.length, 1);

  const share = page.onShareAppMessage();
  assert.deepEqual(share, buildDefaultSharePayload(page.data.result));
  assert.doesNotMatch(JSON.stringify(share), /1978|360|个人账户|缴费年限|元/);
}

function runResultRejectsStalePublicCacheSmoke() {
  resetStore();
  resetCalls();
  const { calculatePensionEstimate } = require('../miniprogram/utils/pensionCalculator');
  const storage = require('../miniprogram/utils/storage');
  const result = calculatePensionEstimate({
    city: 'shanghai',
    workerType: 'male',
    birthMonth: '1968-06',
    paidMonths: 360,
    contributionInput: { type: 'ratio', contributionIndex: 1 },
    personalAccount: { known: false, balance: null },
    mode: 'public'
  });
  wx.setStorageSync(storage.LAST_RESULT_KEY, result);

  const page = loadPage('miniprogram/pages/result/result.js');
  page.onShow();

  assert.equal(page.data.result, null);
  assert.equal(wx.getStorageSync(storage.LAST_RESULT_KEY), '');
  assert.equal(calls.showShareMenu.length, 0);
  assert.equal(calls.hideShareMenu.length, 1);
  assert.match(calls.showToast.at(-1).title, /暂未开放/);
}

function runAccountSmoke() {
  resetStore();
  resetCalls();
  const storage = require('../miniprogram/utils/storage');
  wx.setStorageSync(storage.LAST_INPUT_KEY, {
    city: 'shanghai',
    workerType: 'male',
    birthMonth: '1968-06',
    paidMonths: 360,
    contributionInput: { type: 'ratio', contributionIndex: 1 },
    personalAccount: { known: false, balance: null },
    mode: 'public'
  });
  wx.setStorageSync(storage.LAST_RESULT_KEY, {
    city: 'shanghai',
    releaseMode: 'public',
    amount: { monthlyTotal: 5200 }
  });

  const page = loadPage('miniprogram/pages/account/account.js');
  page.onLoad({});
  page.onInput(inputValue('180000'));
  page.save();

  assert.equal(wx.getStorageSync(storage.ACCOUNT_BALANCE_KEY), 180000);
  assert.equal(wx.getStorageSync(storage.LAST_INPUT_KEY), '');
  assert.equal(wx.getStorageSync(storage.LAST_RESULT_KEY), '');
  assert.equal(calls.navigateBack.length, 1);
}

function runAccountValidationSmoke() {
  resetStore();
  resetCalls();
  const storage = require('../miniprogram/utils/storage');
  const page = loadPage('miniprogram/pages/account/account.js');
  page.onLoad({});
  page.onInput(inputValue('1800000'));
  page.save();

  assert.equal(wx.getStorageSync(storage.ACCOUNT_BALANCE_KEY), '');
  assert.match(page.data.error, /偏高/);
  assert.match(calls.showToast.at(-1).title, /偏高/);
  assert.equal(calls.navigateBack.length, 0);
}

runHomeSmoke();
runCalculateSmoke();
runCalculateValidationSmoke();
runResultSmoke();
runResultRejectsStalePublicCacheSmoke();
runAccountSmoke();
runAccountValidationSmoke();

console.log('OK mini program page smoke interactions');
