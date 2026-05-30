# 退休金算盘数据目录

更新时间：2026-05-28

本目录用于维护“退休金算盘 / Pension Abacus”的养老金测算基础数据。

## 当前状态

当前已建立数据仓库骨架，并维护第一批官方来源数据。注意：这些数据大多仍处于待二次复核状态，不能直接视为生产可用精算参数。

已维护：

- 国家政策基础参数。
- 渐进式延迟退休年龄和最低缴费年限可计算规则初版。
- 个人账户养老金计发月数表。
- 上海 2025 年缴费基数上下限和工资口径。
- 北京 2025 年缴费基数上下限和养老待遇计算基数。
- 深圳 2025 年养老金计发基数。
- 广东 2025 年职工基本养老保险缴费基数上下限，其中深圳适用性仍需二次复核。
- 上海、北京、深圳 2015-2025 关键参数工作台初版，其中北京缴费基数相对完整，上海和深圳仍有候选值或缺口。
- 退休年龄规则穷举测试样例、MVP 测算输入矩阵样例和扩展测算输入矩阵样例。

未完成：

- 上海、北京、深圳 2000-2014 历史年度参数回补。
- 上海 2015-2019、2022-2023 官方来源复核。
- 深圳 2015-2023 历史参数完整回补。
- 个人账户记账利率历史数据。
- 三城过渡性养老金历史政策分段。
- benchmark 样本生成。
- 养老金金额 expected value 测试样例。

## 目录结构

```text
data/
  official/
    sources.json
    pension-policy.json
    payout-months.json
    retirement-age-rules.json
    city-params.json
    city-history-params.json
    city-history-coverage.json
    city-key-params-2015-2025.json
    source-backlog-2026-05-28.json
  generated/
    benchmark-meta.json
    generate-test-samples.mjs
    retirement-age-test-cases.json
    calculation-mvp-test-samples.json
    calculation-test-samples.json
  changelog/
    2026-05-28-initial-seed.md
    2026-05-28-retirement-and-key-params.md
```

## 数据状态说明

- `official`：已记录官方来源的数据或待复核的官方来源线索。
- `generated`：基于 official 数据生成的产品模型数据，不属于官方数据。
- `changelog`：每次参数维护记录。

当前主要状态：

- `pending_second_review`：已采集，待二次复核。
- `pending_city_applicability_review`：来源已采集，但还需确认城市适用性。
- `partial`：该年份仅部分字段已维护。
- `missing_pending_backfill`：字段缺失，待回补。

## 重要原则

用户输入可以粗略，但系统基础数据不能偷懒。历史年度参数缺失时，必须显式标记，不允许静默使用最新年份参数替代全部历史。
