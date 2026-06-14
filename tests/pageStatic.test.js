const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('result page exposes a visible privacy-safe share button', () => {
  const wxml = read('miniprogram/pages/result/result.wxml');

  assert.match(wxml, /open-type="share"/);
  assert.match(wxml, /分享给朋友/);
});

test('result share button stretches like the other action buttons', () => {
  const wxss = read('miniprogram/pages/result/result.wxss');

  assert.match(wxss, /\.share-button\s*\{[\s\S]*width:\s*100%/);
  assert.match(wxss, /\.share-button\s*\{[\s\S]*margin:\s*0/);
});

test('calculate page uses a disabled submit tap handler instead of binding disabled button directly to submit', () => {
  const wxml = read('miniprogram/pages/calculate/calculate.wxml');
  const js = read('miniprogram/pages/calculate/calculate.js');

  assert.match(wxml, /bindtap="onSubmitTap"/);
  assert.match(js, /onSubmitTap\(\)/);
});

test('calculate page renders worker type choices in a two-column grid', () => {
  const wxml = read('miniprogram/pages/calculate/calculate.wxml');
  const wxss = read('miniprogram/pages/calculate/calculate.wxss');

  assert.match(wxml, /class="worker-grid"/);
  assert.match(wxss, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test('calculate page opens birth month picker near target users instead of current month', () => {
  const wxml = read('miniprogram/pages/calculate/calculate.wxml');
  const js = read('miniprogram/pages/calculate/calculate.js');

  assert.match(wxml, /value="\{\{birthMonthPickerValue\}\}"/);
  assert.match(wxml, /start="\{\{birthMonthStart\}\}"/);
  assert.match(wxml, /end="\{\{birthMonthEnd\}\}"/);
  assert.match(js, /birthMonthPickerValue/);
  assert.match(js, /birthMonthStart/);
  assert.match(js, /birthMonthEnd/);
});

test('calculate page adjusts unopened birth month picker by worker type', () => {
  const js = read('miniprogram/pages/calculate/calculate.js');

  assert.match(js, /DEFAULT_BIRTH_PICKER_AGE_BY_WORKER_TYPE/);
  assert.match(js, /getDefaultBirthMonthPickerValue\(workerType/);
  assert.match(js, /!this\.data\.birthMonth/);
});

test('result page displays a retirement month range for unknown female worker type', () => {
  const wxml = read('miniprogram/pages/result/result.wxml');
  const js = read('miniprogram/pages/result/result.js');

  assert.match(js, /retirementMonthText/);
  assert.match(wxml, /退休月份/);
});

test('home page includes retention hooks for returning and family-assisted use', () => {
  const wxml = read('miniprogram/pages/home/home.wxml');
  const js = read('miniprogram/pages/home/home.js');

  assert.match(wxml, /继续上次测算/);
  assert.match(wxml, /帮家人测算/);
  assert.match(js, /openLastResult/);
  assert.match(js, /startFamilyEstimate/);
});

test('home page references the managed logo asset', () => {
  const wxml = read('miniprogram/pages/home/home.wxml');
  const logoPath = path.join(root, 'miniprogram/assets/logo-pension-abacus.png');

  assert.match(wxml, /logo-pension-abacus\.png/);
  assert.equal(fs.existsSync(logoPath), true);
});

test('home page avoids stacked trust badges and redundant option marks', () => {
  const homeWxml = read('miniprogram/pages/home/home.wxml');
  const homeWxss = read('miniprogram/pages/home/home.wxss');
  const calculateWxml = read('miniprogram/pages/calculate/calculate.wxml');
  const calculateWxss = read('miniprogram/pages/calculate/calculate.wxss');

  assert.doesNotMatch(homeWxml, /trust-strip/);
  assert.doesNotMatch(homeWxml, /上海首开/);
  assert.doesNotMatch(homeWxml, /brand-proofline/);
  assert.doesNotMatch(homeWxml, /module-meta/);
  assert.doesNotMatch(homeWxml, /不作官方核定/);
  assert.match(homeWxss, /linear-gradient\(135deg/);
  assert.doesNotMatch(calculateWxml, /selection-mark/);
  assert.doesNotMatch(calculateWxss, /\.selection-mark/);
});

test('premium texture surfaces are visible across core pages', () => {
  const homeWxml = read('miniprogram/pages/home/home.wxml');
  const calculateWxml = read('miniprogram/pages/calculate/calculate.wxml');
  const appWxss = read('miniprogram/app.wxss');

  assert.match(homeWxml, /brand-panel/);
  assert.match(calculateWxml, /form-brief/);
  assert.match(appWxss, /border-left:\s*6rpx solid #B7791F/);
});

test('result page keeps the report focused and does not render internal placeholders', () => {
  const wxml = read('miniprogram/pages/result/result.wxml');
  const js = read('miniprogram/pages/result/result.js');

  assert.match(wxml, /canShare/);
  assert.doesNotMatch(wxml, /credibility-rail/);
  assert.doesNotMatch(wxml, /参数凭证/);
  assert.doesNotMatch(wxml, /发布模式/);
  assert.doesNotMatch(wxml, /待补字段/);
  assert.doesNotMatch(js, /releaseModeText/);
  assert.match(js, /canShare/);
  assert.doesNotMatch(wxml, /退休金竞争力/);
  assert.doesNotMatch(wxml, /benchmark 闸门/);
});

test('public release profile keeps internal preview disabled by default', () => {
  const featuresJs = read('miniprogram/config/features.js');
  const aboutJs = read('miniprogram/pages/about/about.js');
  const calculateJs = read('miniprogram/pages/calculate/calculate.js');

  assert.match(featuresJs, /releaseProfile:\s*'public'/);
  assert.match(featuresJs, /internalPreviewEnabled:\s*false/);
  assert.match(featuresJs, /competitionEnabled:\s*false/);
  assert.match(featuresJs, /previewCities:\s*\[\s*'shanghai'\s*\]/);
  assert.doesNotMatch(aboutJs, /internalPreview:\s*true/);
  assert.match(aboutJs, /features\.internalPreviewEnabled/);
  assert.match(calculateJs, /features\.previewCities/);
});

test('result page explains why the amount was estimated', () => {
  const wxml = read('miniprogram/pages/result/result.wxml');
  const js = read('miniprogram/pages/result/result.js');

  assert.match(wxml, /为什么是这个数/);
  assert.match(wxml, /result\.explainers/);
  assert.match(js, /explainers/);
  assert.match(js, /缴费年限/);
  assert.match(js, /缴费水平/);
  assert.match(js, /个人账户/);
});

test('result page shows a user-facing data explanation without internal labels', () => {
  const wxml = read('miniprogram/pages/result/result.wxml');
  const js = read('miniprogram/pages/result/result.js');
  const calculatorJs = read('miniprogram/utils/pensionCalculator.js');

  assert.match(wxml, /数据说明/);
  assert.match(wxml, /result\.dataStatusText/);
  assert.match(wxml, /result\.dataImpactText/);
  assert.match(wxml, /bindtap="openAbout"/);
  assert.match(wxml, /查看数据来源和免责声明/);
  assert.match(js, /dataStatusText/);
  assert.match(js, /dataImpactText/);
  assert.doesNotMatch(wxml, /数据复核中|待补字段|参数版本/);
  assert.doesNotMatch(calculatorJs, /上线门槛/);
});

test('family estimate and contribution choices are presented as user-friendly flows', () => {
  const calculateWxml = read('miniprogram/pages/calculate/calculate.wxml');
  const calculateJs = read('miniprogram/pages/calculate/calculate.js');
  const storageJs = read('miniprogram/utils/storage.js');

  assert.match(calculateWxml, /scenario-banner/);
  assert.match(calculateJs, /更多缴费档位/);
  assert.match(calculateJs, /visibleContributionOptions/);
  assert.match(calculateJs, /FAMILY_LAST_RESULT_KEY/);
  assert.match(storageJs, /FAMILY_LAST_RESULT_KEY/);
});

test('about and account pages explain city progress and account lookup guidance', () => {
  const aboutWxml = read('miniprogram/pages/about/about.wxml');
  const aboutJs = read('miniprogram/pages/about/about.js');
  const accountWxml = read('miniprogram/pages/account/account.wxml');

  assert.match(aboutWxml, /支持城市/);
  assert.match(aboutJs, /cityProgress/);
  assert.match(accountWxml, /怎么查询/);
  assert.match(accountWxml, /人社/);
});

test('about page does not expose internal version or benchmark wording to users', () => {
  const aboutWxml = read('miniprogram/pages/about/about.wxml');
  const aboutJs = read('miniprogram/pages/about/about.js');

  assert.doesNotMatch(aboutWxml, /benchmark/);
  assert.doesNotMatch(aboutWxml, /V1 不登录/);
  assert.doesNotMatch(aboutWxml, /同城估算样本/);
  assert.doesNotMatch(aboutWxml, /参数版本/);
  assert.doesNotMatch(aboutWxml, /城市当前参数/);
  assert.doesNotMatch(aboutJs, /showPeerSample/);
  assert.match(aboutWxml, /不登录，不上传用户数据/);
});

test('account page reassures users who cannot find account balance', () => {
  const accountWxml = read('miniprogram/pages/account/account.wxml');

  assert.match(accountWxml, /找不到这个数也没关系/);
  assert.match(accountWxml, /继续使用系统估算/);
});

test('account page gives Shanghai users a concrete account balance lookup path', () => {
  const accountWxml = read('miniprogram/pages/account/account.wxml');

  assert.match(accountWxml, /随申办/);
  assert.match(accountWxml, /上海人社/);
  assert.match(accountWxml, /养老保险个人账户/);
  assert.match(accountWxml, /个人账户累计储存额/);
});

test('about page uses user-facing city progress copy', () => {
  const aboutJs = read('miniprogram/pages/about/about.js');

  assert.match(aboutJs, /可测算/);
  assert.match(aboutJs, /暂未开放测算/);
  assert.doesNotMatch(aboutJs, /可试算|可先试算/);
  assert.doesNotMatch(aboutJs, /已归集/);
  assert.doesNotMatch(aboutJs, /补齐中/);
  assert.doesNotMatch(aboutJs, /个完整年份/);
});

test('normal user pages avoid internal operations wording', () => {
  const files = [
    'miniprogram/pages/home/home.wxml',
    'miniprogram/pages/calculate/calculate.wxml',
    'miniprogram/pages/result/result.wxml',
    'miniprogram/pages/account/account.wxml',
    'miniprogram/pages/about/about.wxml'
  ];
  const forbidden = [
    /内部预览/,
    /内部测试/,
    /发布模式/,
    /参数版本/,
    /参数凭证/,
    /待补字段/,
    /二次复核/,
    /数据复核中/,
    /历史参数补齐中/,
    /补齐中/
  ];

  for (const file of files) {
    const content = read(file);
    for (const pattern of forbidden) {
      assert.doesNotMatch(content, pattern, `${file} exposes ${pattern}`);
    }
  }
});

test('pages avoid complex WXML expressions that can break mini program rendering', () => {
  const pageFiles = [
    'miniprogram/pages/home/home.wxml',
    'miniprogram/pages/calculate/calculate.wxml',
    'miniprogram/pages/result/result.wxml',
    'miniprogram/pages/account/account.wxml',
    'miniprogram/pages/about/about.wxml'
  ];
  const forbidden = [
    /\{\{[^}]*\|\|[^}]*\}\}/,
    /\{\{[^}]*===?[^}]*\}\}/,
    /\{\{[^}]*!==?[^}]*\}\}/,
    /\{\{[^}]*\?[^}]*:[^}]*\}\}/,
    /\{\{[^}]*![^}]*\}\}/,
    /\{\{[^}]*\/[^}]*\}\}/
  ];

  for (const file of pageFiles) {
    const wxml = read(file);
    for (const pattern of forbidden) {
      assert.doesNotMatch(wxml, pattern, `${file} contains risky WXML expression ${pattern}`);
    }
  }
});

test('mini program runtime code does not require JSON files directly', () => {
  const files = [
    'miniprogram/pages/about/about.js',
    'miniprogram/utils/dataGate.js',
    'miniprogram/utils/pensionCalculator.js',
    'miniprogram/utils/retirement.js'
  ];

  for (const file of files) {
    assert.doesNotMatch(read(file), /require\([^)]*\.json['"]\)/, `${file} requires JSON directly`);
  }
});
