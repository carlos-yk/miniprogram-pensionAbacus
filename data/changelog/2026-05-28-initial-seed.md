# 2026-05-28 初始数据建库

本次创建退休金算盘官方参数数据目录。

## 新增文件

- `data/official/sources.json`
- `data/official/pension-policy.json`
- `data/official/payout-months.json`
- `data/official/city-history-params.json`
- `data/official/city-params.json`
- `data/official/city-history-coverage.json`
- `data/generated/benchmark-meta.json`

## 已维护数据

- 国家政策基础来源。
- 个人账户养老金计发月数表。
- 上海 2025 年缴费基数上下限和全口径平均工资。
- 北京 2025 年缴费基数上下限和养老待遇计算基数。
- 深圳 2025 年养老金计发基数。
- 广东 2025 年企业职工基本养老保险缴费基数上下限，作为深圳缴费基数候选来源，仍需二次复核深圳适用性。

## 暂未完成

- 2000-2024 历史年度城市参数。
- 历年个人账户记账利率。
- 退休年龄完整查表。
- benchmark 样本生成。

## 注意

当前所有数据状态均为 `pending_second_review` 或 `partial`，不能直接作为生产精算参数发布。

