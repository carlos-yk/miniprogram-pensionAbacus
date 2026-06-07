# 退休金算盘 / Pension Abacus 文档索引

更新时间：2026-05-28

本文档目录沉淀当前需求讨论成果，用于后续进入正式设计、原型、开发或新会话交接。

## 项目名称

中文名：退休金算盘

英文名：Pension Abacus

核心标语：少填也能算，细填更准确。

## 文档结构

- [01 产品定位与目标](./01-product-positioning.md)：定位、背景、目标用户、产品边界。
- [02 功能设计](./02-functional-design.md)：首页模块、城镇职工 V1 功能、输入字段、结果页能力。
- [03 系统交互与页面流程](./03-interaction-flow.md)：快速测算、补充信息、结果页、分享链路。
- [04 计算模型与竞争力评分](./04-calculation-and-scoring.md)：养老金估算公式、估算范围、竞争力分数闸门、榜单口径。
- [05 基础数据与官方参数库](./05-data-library.md)：官方参数、数据来源、JSON 格式、维护策略。
- [06 功能规划与迭代路线](./06-roadmap.md)：V1、V1.1、V2、长期模块规划。
- [07 沟通过程与决策记录](./07-discussion-and-decisions.md)：本轮讨论的关键思路、确认事项、取舍原因。
- [08 待确认问题](./08-open-questions.md)：进入正式设计前仍需拍板的事项。
- [09 官方数据来源与维护机制](./09-official-data-source-and-maintenance.md)：官方来源清单、字段映射、年度维护 SOP、复核和发布流程。
- [10 历史城市基础数据策略](./10-historical-city-data-strategy.md)：为什么需要维护历年城市参数、哪些数据必须补全、如何分阶段建设。
- [11 数据缺口与补齐优先级](./11-data-gap-and-priority.md)：当前数据缺口、硬依赖、补齐顺序、V1 可开发和可上线门槛。
- [12 测试样例策略](./12-test-sample-strategy.md)：MVP 样例、扩展样例、规则穷举和后续金额 expected value 维护方式。
- [13 UI 风格与交互设计](./13-ui-style-and-interaction-design.md)：小程序视觉方向、页面布局、交互规则、组件和文案。
- [14 UI 设计 QA 验收报告](./14-ui-qa-acceptance-review.md)：UI 方案验收结论、P1/P2 风险、进入原型前验收标准。
- [15 小程序功能 QA 验收报告](./15-miniprogram-qa-acceptance-review.md)：已实现小程序的功能验收结论、P1/P2 风险、联调建议。
- [16 发布就绪与真机验收清单](./16-release-readiness-and-device-qa.md)：发布闸门、微信开发者工具、真机 QA、数据发布和应急处理清单。

## 数据目录

- [data/README.md](../data/README.md)：数据目录说明。
- [data/official/sources.json](../data/official/sources.json)：官方来源目录。
- [data/official/city-history-params.json](../data/official/city-history-params.json)：城市历史参数主文件。
- [data/official/city-history-coverage.json](../data/official/city-history-coverage.json)：历史年份覆盖状态。
- [data/generated/retirement-age-test-cases.json](../data/generated/retirement-age-test-cases.json)：退休年龄规则穷举测试样例。
- [data/generated/calculation-mvp-test-samples.json](../data/generated/calculation-mvp-test-samples.json)：MVP 养老金测算输入矩阵测试样例。
- [data/generated/calculation-test-samples.json](../data/generated/calculation-test-samples.json)：扩展养老金测算输入矩阵测试样例。
- [data/generated/city-data-backfill-tasks.json](../data/generated/city-data-backfill-tasks.json)：城市历史参数、来源复核和首开上海发布前补齐任务清单。

## 小程序实现

当前已建立原生微信小程序工程：

- [project.config.json](../project.config.json)：微信开发者工具项目配置。
- [miniprogram/app.json](../miniprogram/app.json)：小程序页面注册和全局窗口配置。
- [miniprogram/pages/home/home.wxml](../miniprogram/pages/home/home.wxml)：首页，展示 6 个模块，只有城镇职工入口可点击。
- [miniprogram/pages/calculate/calculate.wxml](../miniprogram/pages/calculate/calculate.wxml)：快速测算页，包含出生年月、退休类型、城市、缴费年限、缴费水平和账户余额入口。
- [miniprogram/pages/result/result.wxml](../miniprogram/pages/result/result.wxml)：结果页，展示金额、区间、拆分、估算状态、关键假设、数据质量和免责声明。
- [miniprogram/pages/account/account.wxml](../miniprogram/pages/account/account.wxml)：个人账户余额补充页。
- [miniprogram/pages/about/about.wxml](../miniprogram/pages/about/about.wxml)：数据来源、隐私和免责声明页。
- [miniprogram/utils](../miniprogram/utils)：退休年龄、数据闸门、养老金估算、本地缓存等核心模块。
- [tests](../tests)：Node.js 核心逻辑和配置校验。

本地校验命令：

```bash
npm run verify
```

查看发布状态快照：

```bash
npm run release:status
npm run release:status:json
```

微信开发者工具 CLI 检查：

```bash
npm run verify:devtools
```

发布前专项检查：

```bash
npm run verify:assets
npm run verify:data-readiness
npm run verify:data-backfill-tasks
npm run qa:device-evidence:init
npm run verify:qa-privacy
npm run verify:device-qa
npm run verify:release
```

重新生成数据补齐任务清单：

```bash
npm run data:backfill-tasks
```

## 当前已确认结论

- 小程序定位为工具化养老金测算产品，V1 不做完整养老规划。
- V1 首个可用模块为“城镇职工基本养老保险估算”。
- V1 目标支持城市为上海、北京、深圳；具体城市是否开放取决于该城市是否达到数据上线门槛。
- V1 采用纯前端实现，不做登录，不上传用户数据。
- 支持本地缓存最近一次测算记录。
- 首页展示 6 个养老金相关模块，其中城镇职工养老金测算可用，其他模块置灰并显示“敬请期待”。
- 性别 / 退休类型文案采用“男性”“女性，约 55 岁退休”“女性，约 50 岁退休”“不确定，帮我估算”。
- 页面原则是低门槛、少输入、可模糊填写、先快速估算，再通过个人账户余额等信息提高可信度。
- 结果页展示总额、拆分项、估算范围、关键假设、数据质量、估算状态标签和免责声明。
- 结果页 V1 使用“估算状态标签”，不使用百分比准确度条。
- 竞争力分数、同城百分位、小奖杯和轻量彩带可作为 V1 增强能力，但只有在固定基准样本生成、通过样例校验并版本化后才展示。
- 竞争力模块在 benchmark 未满足闸门时默认隐藏，不在原型中展示占位卡。
- “不确定，帮我估算”不输出单一确定退休年龄，按可能退休类型给出更宽区间。
- 分享默认不展示养老金金额；如竞争力分数未达到上线门槛，分享只展示普通测算入口和品牌文案。
- V1 原型不展示“分享时展示金额”开关。
- 官方参数必须记录来源、发布日期、生效期、采集人、复核人和参数版本。
- 用户填写可以粗略，但产品维护的城市基础数据应尽量完整，不能把全部历史缴费都按最新年份参数计算。
- 当前状态可以进入低保真或中保真原型；在退休年龄规则、关键历史参数、样例测试和数据复核完成前，不应冻结计算开发或上线测算结果。

## 后续新会话建议

后续正式设计时，可以直接让 Codex 读取本目录：

```text
请读取 /Users/yuankai/work/OPC/PensionAbacus/docs/README.md，并基于文档继续做退休金算盘小程序的产品原型设计。
```
