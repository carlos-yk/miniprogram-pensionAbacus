# 16 发布就绪与真机验收清单

本文档用于冻结发布前检查。当前结论：上海 2015-2025 公开支持范围已可进入测算，发布资产、发布支持文件和工作区检查已通过；正式发布仍被 iOS/Android 真机 QA 证据阻塞。

## 一、自动化检查

查看当前发布状态快照：

```bash
npm run release:status
```

该命令不会替代发布闸门；它用于 PM/QA 快速查看当前是 `PASS`、`PASS_WITH_CONCERNS` 还是 `BLOCKED`，并按功能开关、发布资产、城市闸门、上海数据、竞争力模块、真机前置条件分组展示。

状态快照还会展示 `Data Backfill Tasks`。若公开支持范围仍有 P0 缺口，会列出首开城市 P0 补齐任务；当前上海 2015-2025 支持范围已通过，2000-2007、2013 早年历史参数作为 P1 backlog 继续追踪。完整任务以 `data/generated/city-data-backfill-tasks.json` 为准。

状态快照还会展示 `Release readiness next actions`，按 `git`、`data`、`qa` 拆分 P0 行动；当前 P0 主要对应微信开发者工具预览和真机证据补齐。机器可读 JSON 同步包含 `nextActions` 字段；若后续有发布资产或支持文件本地改动，状态快照会重新给出需要提交的 `git add` 命令。

需要机器可读输出时运行：

```bash
npm run release:status:json
```

每次准备提交或发版前先运行：

```bash
npm run verify
```

当前预期：应通过。

发布闸门检查：

```bash
npm run verify:release
```

当前预期：应失败，直到以下阻塞全部解除：

- 微信开发者工具预览和真机 QA 证据通过。

总闸门失败时会聚合关键下一步，包括微信开发者工具预览命令和真机 QA 证据文件路径；若发布资产或发布支持文件出现未提交改动，也会输出对应 `git add` 命令。正式发版前必须让该命令通过。

发布资产检查：

```bash
npm run verify:assets
```

发布图片和后续分享图必须登记在 `miniprogram/assets/release-assets.json`。清单会校验：

- 文件存在。
- 文件已纳入 git。
- 图片尺寸和大小符合清单约束。
- 页面引用路径与清单一致。

当资产存在但未进入版本控制，或已跟踪资产仍有本地未提交改动时，该命令会输出需要执行的 `git add` 命令。当前发布资产清单已进入版本控制；后续新增或替换图片时仍需重新运行该检查。

发布支持文件检查由 `npm run release:status` 和 `npm run verify:release` 自动执行。以下文件必须随代码进入版本控制，且没有本地未提交改动，否则发布闸门会阻塞：

- 发布清单文档：`docs/16-release-readiness-and-device-qa.md`
- 真机 QA 模板：`qa/device-qa-evidence.example.json`
- 数据补齐任务清单和生成脚本：`data/generated/city-data-backfill-tasks.json`、`data/generated/generate-city-data-backfill-tasks.mjs`
- 发布状态、数据、资产、DevTools、设备 QA、隐私检查等校验脚本及其 `tests/lib/` 依赖

这些文件不属于用户隐私证据，必须提交；真实设备证据 `qa/device-qa-evidence.json` 和 `qa/artifacts/` 截图仍然只保留在本机。

发布工作区检查也由 `npm run release:status` 和 `npm run verify:release` 自动执行。`.gitignore`、`package.json`、`project.config.json`、`data/`、`docs/`、`miniprogram/`、`tests/` 和 `qa/device-qa-evidence.example.json` 下的发布相关改动必须全部进入 git；否则本地验证通过的内容可能不会出现在最终提交或发布包中。真实设备证据文件和截图会继续被忽略，不纳入该检查。

QA 证据隐私和发布资产 git hygiene 检查：

```bash
npm run verify:qa-privacy
```

该命令会确认 `qa/device-qa-evidence.json` 与 `qa/artifacts/` 下的真机截图仍被 `.gitignore` 忽略，同时确认 `miniprogram/assets/release-assets.json` 和发布 logo 没有被误加入忽略规则，避免证据泄露或线上包缺图。

上海数据就绪检查：

```bash
npm run verify:data-readiness
```

当前预期：应通过，但会提示上海 2000-2007、2013 仍是公开支持范围外的历史 backlog。

当该命令存在警告或失败时，会输出首开城市数据任务摘要，便于数据补齐和复核按同一份清单推进。

生成数据补齐任务清单：

```bash
npm run data:backfill-tasks
```

校验补齐任务清单是否与当前源数据一致：

```bash
npm run verify:data-backfill-tasks
```

任务清单位于 `data/generated/city-data-backfill-tasks.json`。它会把上海首开数据、北京/深圳后续开放数据和来源 backlog 拆成可追踪任务；其中上海公开支持范围内任务为发布前 P0，支持范围外早年历史参数为 P1 backlog。

开发者工具 CLI 检查：

```bash
npm run verify:devtools
```

生成登录二维码：

```bash
npm run qa:devtools-login
```

生成预览二维码：

```bash
npm run verify:devtools:preview
```

`verify:devtools:preview` 需要在非沙箱、微信开发者工具已登录且允许本地自动化监听端口的桌面环境执行。
若 `release:status` 提示微信开发者工具未登录，先执行输出中的 `Login command` 并扫码登录，再重新生成预览。
预览二维码和预览信息会生成到 `qa/artifacts/devtools/preview.png` 与 `qa/artifacts/devtools/preview.json`；该目录被 git 忽略，只作为本机 QA 证据使用。

真机验收证据检查：

```bash
npm run verify:device-qa
```

初始化真机验收证据草稿：

```bash
npm run qa:device-evidence:init
```

该命令会基于 `qa/device-qa-evidence.example.json` 生成 `qa/device-qa-evidence.json` 草稿；它只用于减少手工抄字段，不代表验收通过。草稿会保持 `devtools.previewGenerated=false`、设备 `result=pending`、所有 `checks.*=false`。

真实 iOS 和 Android 主流程都验收通过后，可以用辅助命令写入证据，避免手填 JSON 漏字段：

```bash
npm run qa:device-evidence:complete -- \
  --tester "测试人姓名" \
  --ios-model "iPhone 机型" --ios-os "iOS 版本" --ios-wechat "微信版本" --ios-screenshot "qa/artifacts/ios-main-flow.png" \
  --android-model "Android 机型" --android-os "Android 版本" --android-wechat "微信版本" --android-screenshot "qa/artifacts/android-main-flow.png" \
  --confirm-real-device
```

`qa:device-evidence:complete` 会校验预览二维码、预览信息、iOS 截图和 Android 截图文件都存在；没有 `--confirm-real-device` 时不会把设备和检查项标记为通过。该确认只应在真实扫码验收完成后使用。

真实验收后，填写 `qa/device-qa-evidence.json`。实际证据文件默认不提交到 git，但发布闸门会读取它，确认 iOS、Android、预览二维码和关键流程验收均通过。

`devtools.previewGenerated=true only after` `npm run verify:devtools:preview` 已真实生成二维码和预览信息文件。将 `checks.*` 设置为 true 前必须完成真实 iOS 和 Android 真机验证；不能为了通过发布闸门提前改成 true。

证据文件中的预览二维码、预览信息和真机截图必须能在本机找到：

- `devtools.qrOutput` 指向 `verify:devtools:preview` 生成的二维码图片。
- `devtools.infoOutput` 指向 `verify:devtools:preview` 生成的预览信息 JSON。
- 每台设备的 `screenshot` 指向该设备主流程验收截图。
- 建议把真机截图临时放在 `qa/artifacts/`；该目录不作为发布资产提交。

当证据缺失或过期时，该命令会输出下一步指引，包括：

- 先运行 `npm run verify:devtools` 确认微信开发者工具 CLI。
- 运行 `npm run qa:device-evidence:init` 生成保守证据草稿。
- 在非沙箱、已登录微信开发者工具的桌面运行 `npm run verify:devtools:preview`。
- 用 `qa/device-qa-evidence.example.json` 填写 `qa/device-qa-evidence.json`。
- 保留 `devtools.qrOutput`、`devtools.infoOutput` 和每台设备 `screenshot` 对应的本地文件。
- 覆盖 iOS 和 Android。
- 确认首页入口、城市闸门、核心历史参数缺失阻断、非核心历史参数软提示继续估算、表单校验、账户余额流程、上海账户查询路径、结果解释、数据来源/隐私/免责声明、分享隐私、大字号、键盘安全区等检查项。
- `testedAt` 必须晚于最近一次小程序、数据或发布资产变更。

每次修改小程序页面、配置、数据或发布资产后，都必须重新生成预览、重新真机验收，并更新 `testedAt`。如果证据时间早于最新的小程序/数据/资产修改时间，发布闸门会判定证据过期。

## 二、发布前阻塞项

当前不能冻结发布版，原因如下：

- 北京、深圳仍保持不可公开测算。
- 小程序必须通过微信开发者工具真实编译、预览和真机扫码验收。
- 真机验收后必须留下 `qa/device-qa-evidence.json` 证据文件。
- `qa/device-qa-evidence.json` 的 `testedAt` 必须晚于最近一次小程序、数据或发布资产变更，并且包含真实 tester、iOS/Android 设备信息和截图路径。

## 三、上海数据缺口

`npm run verify:data-readiness` 当前口径：

- 上海公开支持范围为 2015-2025，城市状态为 `ready`。
- 普通用户可以进入上海测算；提交时会按本次已缴年限检查实际触达的历史年份。
- 如果本次输入触达核心历史参数仍缺失的年份，会阻止该组测算并提示核心历史参数仍在核对。
- 如果本次输入只触达个人账户记账利率等非核心历史参数缺口，会给出软提示并允许继续估算，结果页需显示更宽区间和“含历史参数估算”。
- 2000-2007、2013 仍是 partial years，作为 P1 历史补齐 backlog。
- 2000-2003、2005-2007、2013 仍缺 `accountInterestRate`；2004、2008、2009、2010、2011、2012、2014、2015 已完成本轮复核。
- 2000-2005 年平均工资原始官方页面 URL 仍需定位；当前使用法规转载或新闻公开报道记录。
- 2000-2005 年缴费标准原始官方页面 URL 仍需定位；当前使用区政府转载或公开报道交叉记录。
- 2001-2003、2005 年养老保险费率原始官方页面 URL 仍需定位；2000 年单位缴费比例分段已用上海人社官网原文补齐，2004 年单位缴费比例分段已用上海市政府官网原文补齐。
- 2006 年 1-3 月个人账户划入比例已按国发〔2005〕38号制度切换规则补齐；2000-2002 年个人账户划入比例已用上海人社官网原文补齐。
- 2003 年养老保险个人缴费比例 4-7 月分段已由政策转载和公开标准表交叉补齐，仍保留费率原始官方页面 URL 缺口。
- 2011 年 4-6 月缴费基数已用公开报道与上海人社 2011 年 7 月标准交叉补齐，2011 年度已进入 production ready。

核心历史参数缺口未补齐前，触达对应历史年份的输入不能对普通用户开放测算；仅缺非核心历史参数时按软提示继续估算。

更细的补齐任务以 `data/generated/city-data-backfill-tasks.json` 为准。当前清单会自动标记上海 P1 历史补齐任务，包括：

- 2000-2003、2005-2007、2013 缺失字段补齐，尤其是个人账户记账利率、2000-2005 年平均工资原始官方页、2000-2005 年原始官方标准页、2001-2003 与 2005 年养老保险费率原始官方页。
- 2000-2007、2013 production ready 二次复核。

## 四、真机验收范围

至少覆盖 iOS 和 Android 各一台设备。

首页：

- 只开放城镇职工养老金测算入口。
- 机关事业、城乡居民、企业年金、职业年金、个人养老金均提示敬请期待。
- 首页不出现竞争力、百分位、排行榜、奖杯、烟花、彩带。
- 最近一次测算和帮家人测算入口可进入正确流程。

测算页：

- 出生年月、性别/退休类型、城市、已缴费年限、缴费水平均为必填。
- 上海可进入测算；若已缴年限触达核心历史参数缺失年份，普通用户不能提交该组测算。
- 若已缴年限只触达非核心历史参数缺口，需出现软提示，用户确认后可以继续估算。
- 女性退休类型按两列布局展示。
- 未来出生年月、明显过高缴费年限、已明显退休人群给出温和提示。
- 键盘弹起后底部按钮不遮挡输入框。
- 大字号模式下文字不挤压、不重叠。

账户余额页：

- 可填写个人账户余额并返回重算。
- 不知道余额时可以跳过。
- 上海查询指引包含随申办、上海人社、养老保险个人账户、个人账户累计储存额。
- 输入数据只保存在本机，不上传。

结果页：

- 第一屏展示预计养老金、估算范围和最终以社保经办机构核定为准。
- 展示基础养老金、个人账户养老金、过渡性养老金暂未纳入。
- 展示关键假设、数据说明、为什么是这个数、重要提示。
- 分享卡不包含养老金金额、出生年月、缴费年限或个人账户余额。
- 内部预览结果不能分享。
- 不出现内部预览、发布模式、参数版本、待补字段、数据复核中、历史参数补齐中等内部口径。

关于页：

- 城市进度使用普通用户能理解的话术。
- 不展示 benchmark、参数版本或内部发布状态。
- 隐私说明不带 V1 口径。

## 五、数据发布检查

上海公开测算前必须确认：

- `city-history-params.json` 覆盖正式支持的历史年份。
- `city-history-coverage.json` 中上海 `publicSupportedYearRange` 覆盖 2015-2025，且支持范围内无 missing years、无 partial years。
- 支持范围外早年历史参数缺口由输入级闸门拦截，不静默使用最新年份参数替代。
- 个人账户记账利率策略在支持范围内明确。
- 金额 expected values 已重新生成并通过测试。
- `runtime-data.js` 与源数据同步。
- 竞争力 benchmark 仍关闭，除非样本生成、复核、反直觉校验全部完成。

## 六、商业化与灰度

一期不接腾讯广告。广告位可以后续评估，但不作为当前发布条件。

灰度发布前应保持：

- `releaseProfile: 'public'`
- `internalPreviewEnabled: false`
- `competitionEnabled: false`
- `monetizationEnabled: false`

若支持范围内数据或真机验收未通过，继续保持城市不可公开提交；若仅支持范围外早年数据缺口存在，保持输入级历史年份闸门。

## 七、应急处理

发现测算异常时：

- 通过数据闸门关闭城市公开测算。
- 保持本地数据不上传，无需清理服务端用户数据。
- 回退最近一次参数或小程序版本。
- 暂停分享传播入口，优先避免误导用户。
