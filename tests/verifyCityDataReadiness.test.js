const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

test('city data readiness passes supported range while warning about historical backlog', () => {
  const result = spawnSync(process.execPath, ['tests/verify-city-data-readiness.js'], {
    cwd: root,
    encoding: 'utf8'
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0);
  assert.doesNotMatch(output, /City data readiness blockers for shanghai/);
  assert.match(output, /City data readiness warnings/);
  assert.match(output, /Historical backlog outside public supported range: 2000-2007, 2013/);
  assert.match(output, /Data backfill tasks for shanghai \(P0\): none/);
  assert.doesNotMatch(output, /Partial history years remain/);
  assert.doesNotMatch(output, /Target range is not fully complete/);
  assert.doesNotMatch(output, /Yearly params not marked production ready/);
  assert.doesNotMatch(output, /Missing history years remain: 2000/);
  assert.doesNotMatch(output, /backfill-year-params: 1/);
  assert.doesNotMatch(output, /fill-missing-fields: 9/);
  assert.doesNotMatch(output, /production-ready-review: 9/);
  assert.doesNotMatch(output, /source-production-review:/);
  assert.doesNotMatch(output, /Missing required field accountInterestRate: 2000-2003, 2005-2007, 2013/);
  assert.doesNotMatch(output, /Missing required field 平均工资原始官方页面URL: 2000-2005/);
  assert.doesNotMatch(output, /Missing required field 社保缴费标准原始官方页面URL: 2000-2005/);
  assert.doesNotMatch(output, /Missing required field 社保缴费标准原始官方页面URL: 2000-2005, 2007-2009/);
  assert.doesNotMatch(output, /Missing required field 养老保险费率原始官方页面URL: 2001-2003, 2005/);
  assert.doesNotMatch(output, /2004-08-01至2005-03-31养老保险单位缴费比例口径/);
  assert.doesNotMatch(output, /Missing required field 2000年度养老保险个人账户划入比例口径: 2000/);
  assert.doesNotMatch(output, /Missing required field 2000-04-01至2000-11-30养老保险单位缴费比例分段口径/);
  assert.doesNotMatch(output, /Missing required field 2001年度养老保险个人账户划入比例口径: 2001/);
  assert.doesNotMatch(output, /Missing required field 2002年度养老保险个人账户划入比例口径: 2002/);
  assert.doesNotMatch(output, /Missing required field 2003-04-01至2003-07-31养老保险个人缴费比例口径: 2003/);
  assert.doesNotMatch(output, /Missing required field 2011-04-01至2011-06-30缴费基数口径: 2011/);
  assert.doesNotMatch(output, /Missing required field 2006-01-01至2006-03-31个人账户划入比例口径: 2005/);
  assert.doesNotMatch(output, /data:shanghai:2000:fill-missing-fields - 上海 2000 年缺失字段补齐/);
  assert.doesNotMatch(output, /data:shanghai:2001:fill-missing-fields - 上海 2001 年缺失字段补齐/);
  assert.doesNotMatch(output, /shanghai-average-wage-2004-public-report/);
  assert.doesNotMatch(output, /shanghai-social-insurance-standard-2003-public-report/);
  assert.doesNotMatch(output, /shanghai-social-insurance-standard-2004-public-report/);
  assert.doesNotMatch(output, /shanghai-social-insurance-standard-2005-public-report/);
  assert.doesNotMatch(output, /shanghai-social-insurance-standard-2006-public-report/);
  assert.doesNotMatch(output, /shanghai-average-wage-1999-regulation-repost review status/);
  assert.doesNotMatch(output, /shanghai-average-wage-2003-regulation-repost review status/);
  assert.doesNotMatch(output, /shanghai-account-interest-rate-2015 review status/);
  assert.doesNotMatch(output, /national-account-interest-rate-2025 review status/);
  assert.doesNotMatch(output, /national-account-interest-rate-2017 review status/);
  assert.doesNotMatch(output, /national-account-interest-rate-2024 review status/);
  assert.doesNotMatch(output, /shanghai-contribution-base-2020 review status/);
  assert.doesNotMatch(output, /shanghai-average-wage-2012 review status/);
  assert.doesNotMatch(output, /shanghai-social-insurance-standard-2013 review status/);
  assert.doesNotMatch(output, /Referenced source .* expected production_ready/);
  assert.doesNotMatch(output, /shanghai-contribution-base-2020 is missing from data\/official\/sources\.json/);
  assert.doesNotMatch(output, /shanghai-contribution-base-2021 is missing from data\/official\/sources\.json/);
  assert.doesNotMatch(output, /shanghai-average-wage-2021 is missing from data\/official\/sources\.json/);
  assert.doesNotMatch(output, /shanghai-contribution-base-2024 is missing from data\/official\/sources\.json/);
});
