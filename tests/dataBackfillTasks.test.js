const test = require('node:test');
const assert = require('node:assert/strict');

const {
  collectDataBackfillTaskSummary
} = require('./lib/dataBackfillTasks');

test('summarizes first-launch city P1 historical backlog tasks', () => {
  const summary = collectDataBackfillTaskSummary({ city: 'shanghai', priority: 'P1', limit: 100 });

  assert.equal(summary.city, 'shanghai');
  assert.equal(summary.priority, 'P1');
  assert.equal(summary.totalTasks, 18);
  assert.deepEqual(summary.byType, {
    'fill-missing-fields': 9,
    'production-ready-review': 9
  });
  assert.equal(summary.visibleTasks.length, 18);
  assert.equal(summary.visibleTasks[0].id, 'data:shanghai:2000:fill-missing-fields');
  assert.match(summary.visibleTasks[0].title, /上海 2000 年缺失字段补齐/);
  assert.ok(summary.visibleTasks[0].targetFiles.includes('data/official/city-history-params.json'));
  assert.ok(summary.visibleTasks[0].targetFiles.includes('miniprogram/data/runtime-data.js'));
  assert.ok(summary.visibleTasks[0].verificationCommands.includes('npm run verify:data-readiness'));
  assert.ok(summary.visibleTasks[0].acceptance.some((item) => item.includes('缺失字段')));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2000:fill-missing-fields' &&
    task.requiredFields.includes('accountInterestRate') &&
    task.requiredFields.includes('平均工资原始官方页面URL') &&
    task.requiredFields.includes('社保缴费标准原始官方页面URL') &&
    !task.requiredFields.includes('2000年度养老保险个人账户划入比例口径') &&
    task.sourceLeads &&
    task.sourceLeads['平均工资原始官方页面URL'] &&
    task.sourceLeads['平均工资原始官方页面URL'].knownRelatedUrls.includes('https://www.laodongfa.com/stadata/dfzf/84.html') &&
    task.sourceLeads['社保缴费标准原始官方页面URL'] &&
    task.sourceLeads['社保缴费标准原始官方页面URL'].searchQueries.some((query) => query.includes('2000年度上海市社会保险费缴费标准')) &&
    !task.requiredFields.includes('养老保险费率原始官方页面URL') &&
    !task.requiredFields.includes('2000-04-01至2000-11-30养老保险单位缴费比例分段口径')
  ));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2000:production-ready-review' &&
    task.requiredFields.includes('averageWage') &&
    task.requiredFields.includes('rates')
  ));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2001:fill-missing-fields' &&
    task.requiredFields.includes('accountInterestRate') &&
    task.requiredFields.includes('平均工资原始官方页面URL') &&
    task.requiredFields.includes('社保缴费标准原始官方页面URL') &&
    task.requiredFields.includes('养老保险费率原始官方页面URL') &&
    !task.requiredFields.includes('2001年度养老保险个人账户划入比例口径')
  ));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2002:fill-missing-fields' &&
    task.requiredFields.includes('accountInterestRate') &&
    task.requiredFields.includes('平均工资原始官方页面URL') &&
    task.requiredFields.includes('社保缴费标准原始官方页面URL') &&
    task.requiredFields.includes('养老保险费率原始官方页面URL') &&
    !task.requiredFields.includes('2002年度养老保险个人账户划入比例口径')
  ));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2003:fill-missing-fields' &&
    task.requiredFields.includes('accountInterestRate') &&
    task.requiredFields.includes('平均工资原始官方页面URL') &&
    task.requiredFields.includes('社保缴费标准原始官方页面URL') &&
    task.requiredFields.includes('养老保险费率原始官方页面URL') &&
    !task.requiredFields.includes('2003-04-01至2003-07-31养老保险个人缴费比例口径')
  ));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2004:fill-missing-fields' &&
    !task.requiredFields.includes('accountInterestRate') &&
    task.requiredFields.includes('平均工资原始官方页面URL') &&
    task.requiredFields.includes('社保缴费标准原始官方页面URL') &&
    !task.requiredFields.includes('养老保险费率原始官方页面URL') &&
    !task.requiredFields.includes('2004-08-01至2005-03-31养老保险单位缴费比例口径')
  ));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2005:fill-missing-fields' &&
    task.requiredFields.includes('accountInterestRate') &&
    task.requiredFields.includes('养老保险费率原始官方页面URL') &&
    task.sourceLeads['社保缴费标准原始官方页面URL'] &&
    task.sourceLeads['社保缴费标准原始官方页面URL'].knownRelatedUrls.includes('https://finance.sina.com.cn/roll/20050325/03241458714.shtml') &&
    !task.requiredFields.includes('2006-01-01至2006-03-31个人账户划入比例口径') &&
    task.sourceLeads &&
    task.sourceLeads.accountInterestRate &&
    task.sourceLeads.accountInterestRate.searchQueries.some((query) => query.includes('2005年度本市养老保险个人账户记账利率'))
  ));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2006:fill-missing-fields' &&
    task.requiredFields.includes('accountInterestRate') &&
    task.sourceLeads &&
    task.sourceLeads.accountInterestRate &&
    task.sourceLeads.accountInterestRate.searchQueries.some((query) => query.includes('2006年度本市养老保险个人账户记账利率')) &&
    !task.requiredFields.includes('平均工资原始官方页面URL') &&
    !task.requiredFields.includes('社保缴费标准原始官方页面URL')
  ));
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2007:fill-missing-fields' &&
    task.requiredFields.includes('accountInterestRate') &&
    task.sourceLeads &&
    task.sourceLeads.accountInterestRate &&
    task.sourceLeads.accountInterestRate.searchQueries.some((query) => query.includes('2007年度本市养老保险个人账户记账利率')) &&
    !task.requiredFields.includes('社保缴费标准原始官方页面URL')
  ));
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2008:fill-missing-fields'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2008:production-ready-review'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2009:fill-missing-fields'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2009:production-ready-review'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2010:fill-missing-fields'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2010:production-ready-review'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2011:fill-missing-fields'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2011:production-ready-review'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2012:fill-missing-fields'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2012:production-ready-review'
  ), false);
  assert.ok(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2013:fill-missing-fields' &&
    task.requiredFields.includes('accountInterestRate') &&
    task.sourceLeads &&
    task.sourceLeads.accountInterestRate &&
    task.sourceLeads.accountInterestRate.knownRelatedUrls.includes('https://www.chinanews.com.cn/sh/2014/06-27/6327411.shtml') &&
    task.sourceLeads.accountInterestRate.searchQueries.some((query) => query.includes('2013年度本市养老保险个人账户记账利率'))
  ));
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:2014:fill-missing-fields'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:shanghai-account-interest-rate-2015:source-production-review'
  ), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:shanghai-average-wage-2004-public-report:source-production-review'
  ), false);
  assert.equal(summary.visibleTasks.some((task) => task.type === 'source-production-review'), false);
  assert.equal(summary.visibleTasks.some((task) =>
    task.id === 'data:shanghai:shanghai-contribution-base-2020:source-production-review'
  ), false);
  assert.equal(new Set(summary.visibleTasks.map((task) => task.id)).size, summary.visibleTasks.length);
  assert.equal(summary.remainingHiddenTasks, 0);
});

test('first-launch P0 data task summary is clear once public supported range is ready', () => {
  const summary = collectDataBackfillTaskSummary({ city: 'shanghai', priority: 'P0', limit: 6 });

  assert.equal(summary.totalTasks, 0);
  assert.deepEqual(summary.byType, {});
  assert.equal(summary.visibleTasks.length, 0);
  assert.equal(summary.remainingHiddenTasks, 0);
});

test('small P1 data task summaries show the earliest remaining historical backlog', () => {
  const summary = collectDataBackfillTaskSummary({ city: 'shanghai', priority: 'P1', limit: 6 });
  const visibleIds = summary.visibleTasks.map((task) => task.id);

  assert.equal(summary.visibleTasks.length, 6);
  assert.ok(visibleIds.includes('data:shanghai:2000:fill-missing-fields'));
  assert.ok(visibleIds.includes('data:shanghai:2001:production-ready-review'));
  assert.equal(visibleIds.some((id) => id.includes('source-production-review')), false);
  assert.equal(visibleIds.includes('data:shanghai:shanghai-contribution-base-2020:source-production-review'), false);
  assert.equal(new Set(visibleIds).size, visibleIds.length);
  assert.equal(summary.remainingHiddenTasks, 12);
});
