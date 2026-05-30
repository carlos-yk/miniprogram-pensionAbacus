# 2026-05-28 测试样例生成

## 新增

- `data/generated/generate-test-samples.mjs`
- `data/generated/retirement-age-test-cases.json`
- `data/generated/calculation-mvp-test-samples.json`
- `data/generated/calculation-test-samples.json`
- `docs/12-test-sample-strategy.md`

## 内容

- 生成 414 条退休年龄规则穷举样例。
- 生成 216 条 MVP 城镇职工养老金测算输入矩阵样例。
- 生成 1446 条城镇职工养老金测算输入矩阵样例。
- 覆盖上海、北京、深圳。
- 覆盖男职工、原 55 岁退休女职工、原 50 岁退休女职工。
- 覆盖不足 15 年、刚满 15 年、刚满 20 年、30 年、40 年缴费场景。
- 覆盖缴费下限、社平附近、高于平均、缴费上限。
- 覆盖个人账户余额未知和已知。
- 补充过渡性养老金提示专项样例。
- 明确 MVP 样例和扩展样例分层，第一版优先使用 MVP 样例。

## 风险

- 当前样例暂不包含养老金金额 expected value。
- 带月份退休年龄的计发月数选择暂按整数年龄向下取整，需政策复核。
- 金额 expected value 需等个人账户记账利率策略和城市参数复核后生成。
