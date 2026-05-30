# 05 基础数据与官方参数库

更新时间：2026-05-28

## 数据策略

V1 采用纯前端实现，因此官方参数库可以打包在小程序代码中。

这样做可行，因为养老金相关公共参数通常按年度或阶段更新，不是高频变化数据。

更详细的官方数据来源、字段映射、年度维护 SOP、复核流程和发布机制见：

[09 官方数据来源与维护机制](./09-official-data-source-and-maintenance.md)

建议策略：

- V1：参数 JSON 随小程序版本发布。
- V1.1：保留远程参数接口扩展位。
- V2：后台维护参数，前端启动时拉取最新配置。

## 数据分类

数据分为两类：

1. 官方参数数据
2. 产品模型数据

官方参数数据必须有来源 URL、发布日期、生效期和字段说明。

产品模型数据是产品自己生成的估算样本和评分模型，不应标注为官方数据。

## V1 必需官方参数

| 数据 | 用途 | 维护粒度 |
| --- | --- | --- |
| 养老金计发基数 | 基础养老金公式 | 城市 + 年度 |
| 全口径城镇单位就业人员平均工资 | 推算缴费指数、缴费上下限 | 城市/省 + 年度 |
| 社保缴费基数下限 | 输入裁剪、最低档估算 | 城市/省 + 年度 |
| 社保缴费基数上限 | 输入裁剪、最高档估算 | 城市/省 + 年度 |
| 个人缴费比例 | 个人账户估算 | 政策参数 |
| 单位缴费比例 | 缴费成本展示 | 政策参数 |
| 灵活就业缴费比例 | 后续支持灵活就业 | 地区/政策 |
| 个人账户记账利率 | 个人账户余额估算 | 年度 |
| 个人账户计发月数表 | 个人账户养老金公式 | 国家表 |
| 法定退休年龄规则 | 推算退休年龄和计发月数 | 出生年月 + 性别/岗位 |
| 最低缴费年限规则 | 判断是否满足领取条件 | 年份 + 政策 |

## 历史数据完整性要求

用户填写的数据可以粗略，但产品维护的城市基础数据必须尽量完整。

养老金估算不能把历史缴费全部按最新年份参数计算，否则会出现系统性偏差。即使用户只填写“已缴费 25 年、长期按 100% 档缴费”，系统也应尽量用每个历史年份对应的城市参数去计算或估算。

历史参数库详见：

[10 历史城市基础数据策略](./10-historical-city-data-strategy.md)

## 城市官方数据来源

以下来源用于 V1 参数库建设。正式上线前需要再次人工核对。

### 上海

上海社保缴费基数上下限、全口径平均工资：

[上海市人力资源和社会保障局相关公告](https://rsj.sh.gov.cn/tgsgg_17341/20250918/t0035_1435637.html)

上海养老金计发办法说明：

[上海市人力资源和社会保障局：养老金计发办法相关页面](https://rsj.sh.gov.cn/tyljjfbf_17557/20250527/t0035_1432739.html)

个人账户计发月数表 PDF：

[上海人社 PDF：个人账户计发月数表](https://rsj.sh.gov.cn/cmsres/e1/e19b75f5a1194a84ad4804905de19713/bf4ed6480e155a32233f8954372ec151.pdf)

### 北京

北京社保缴费工资基数上下限：

[北京市人力资源和社会保障局：2025 年度各项社会保险缴费工资基数上下限通告](https://rsj.beijing.gov.cn/xxgk/2024zcwj/202509/t20250918_4204880.html)

北京社会保险待遇计发基数：

[北京市人力资源和社会保障局：2025 年社会保险待遇计发基数通知](https://rsj.beijing.gov.cn/xxgk/2024zcwj/202511/t20251107_4265291.html)

### 深圳 / 广东

深圳养老金计发基数问答：

[深圳市人力资源和社会保障局：企业职工基本养老保险待遇计发基数相关问答](https://hrss.sz.gov.cn/zmhd/cjwt/cjwt/shbz/content/post_12493488.html)

广东社保缴费基数和养老待遇计发基数相关通知：

[广东省人力资源和社会保障厅相关通知](https://hrss.gd.gov.cn/zwgk/xxgkml/bmwj/qtwj/shbz/content/post_4789618.html)

## 国家政策来源

基础养老金、个人账户养老金制度框架：

[国务院：关于完善企业职工基本养老保险制度的决定，国发〔2005〕38 号](https://www.gov.cn/zhuanti/2015-06/13/content_2878967.htm)

渐进式延迟法定退休年龄、最低缴费年限变化：

[中国政府网：全国人大常委会关于实施渐进式延迟法定退休年龄的决定](https://www.gov.cn/yaowen/liebiao/202409/content_6974294.htm)

单位缴费比例降低至 16% 的政策依据：

[中国政府网：降低社会保险费率综合方案](https://www.gov.cn/zhengce/zhengceku/2019-04/04/content_5379629.htm)

社会保险法：

[中国就业网：中华人民共和国社会保险法](https://chinajob.mohrss.gov.cn/h5/c/2010-10-29/33172.shtml)

## 建议文件结构

```text
data/
  README.md
  official/
    sources.json
    pension-policy.json
    payout-months.json
    city-params.json
    city-history-params.json
    city-history-coverage.json
  generated/
    benchmark-meta.json
  changelog/
    2026-05-28-initial-seed.md
```

当前第一批数据已维护到：

[data/README.md](../data/README.md)

## city-params.json 建议格式

```json
{
  "schemaVersion": "1.0",
  "lastUpdated": "2026-05-28",
  "cities": {
    "shanghai": {
      "name": "上海",
      "params": [
        {
          "year": 2025,
          "effectiveFrom": "2025-07-01",
          "effectiveTo": "2026-06-30",
          "currency": "CNY",
          "pensionCalculationBase": null,
          "avgSalaryForIndex": null,
          "contributionBase": {
            "employee": {
              "floor": null,
              "ceiling": null
            },
            "flexible": {
              "floor": null,
              "ceiling": null
            }
          },
          "rates": {
            "employeePersonalRate": 0.08,
            "employerRate": 0.16,
            "flexibleEmploymentRate": 0.20,
            "personalAccountCreditRate": 0.08
          },
          "sources": [
            {
              "title": "官方公告标题",
              "url": "https://example.gov.cn/...",
              "publishedAt": "2025-09-18",
              "fields": [
                "contributionBase.employee.floor",
                "contributionBase.employee.ceiling"
              ]
            }
          ],
          "notes": "正式填值前需要人工核对官方公告。"
        }
      ]
    }
  }
}
```

## payout-months.json 建议格式

```json
{
  "schemaVersion": "1.0",
  "source": {
    "title": "个人账户养老金计发月数表",
    "url": "https://rsj.sh.gov.cn/cmsres/e1/e19b75f5a1194a84ad4804905de19713/bf4ed6480e155a32233f8954372ec151.pdf"
  },
  "monthsByRetirementAge": {
    "50": 195,
    "55": 170,
    "60": 139,
    "61": 132,
    "62": 125,
    "63": 117,
    "64": 109,
    "65": 101
  }
}
```

## pension-policy.json 建议格式

```json
{
  "schemaVersion": "1.0",
  "lastUpdated": "2026-05-28",
  "policies": {
    "employeePension": {
      "personalContributionRate": 0.08,
      "employerContributionRate": 0.16,
      "minimumContributionYears": {
        "before2030": 15,
        "targetAfterGradualIncrease": 20,
        "notes": "2030 年起按政策逐步提高，需按退休年份处理。"
      },
      "retirementAgePolicy": {
        "type": "progressive_delay",
        "effectiveFrom": "2025-01-01",
        "notes": "需按出生年月、性别、岗位类型查表或实现规则。"
      }
    }
  },
  "sources": [
    {
      "title": "全国人大常委会关于实施渐进式延迟法定退休年龄的决定",
      "url": "https://www.gov.cn/yaowen/liebiao/202409/content_6974294.htm"
    }
  ]
}
```

## benchmark-samples.json 建议格式

```json
{
  "schemaVersion": "1.0",
  "benchmarkVersion": "sh-bj-sz-2026-v1",
  "generatedAt": "2026-05-28",
  "modelVersion": "pension-abacus-v1",
  "cities": {
    "shanghai": [
      {
        "sampleId": "shanghai-001",
        "genderType": "male",
        "retirementAge": 60,
        "contributionYears": 15,
        "averageContributionIndex": 0.6,
        "estimatedMonthlyPension": 0,
        "estimatedAccountBalance": 0,
        "contributionScore": 9
      }
    ]
  }
}
```

## 数据维护流程

建议每年维护一次参数库。

流程：

1. 关注上海、北京、深圳人社局公告。
2. 更新缴费基数上下限、计发基数、社平工资等字段。
3. 更新国家政策变化，例如退休年龄、最低缴费年限。
4. 重新生成 benchmark-samples。
5. 更新 modelVersion 或 benchmarkVersion。
6. 发布小程序新版本。

最低维护要求：

- 每个字段必须有官方来源 URL。
- 每个字段必须记录生效期。
- 上线前必须至少一次人工复核。
- 涉及政策口径变化时，不只改数值，还要检查计算公式。
- 参数变更后必须重新生成 benchmark 样本，否则竞争力分数会和金额结果不一致。
- 不允许静默使用最新年份参数替代全部历史年份；如历史数据缺失，必须在结果精度和参数状态中明确标记。

## 需要特别注意的数据点

- 养老金计发基数和社平工资不是同一个概念，不能混用。
- 缴费基数上下限可能使用全口径平均工资的 60% 和 300%，但具体以地方公告为准。
- 深圳可能涉及广东省级参数和深圳本地计发基数，需特别核对。
- 个人账户记账利率影响个人账户余额估算，不能长期固定为某个值。
- 延迟退休政策会影响退休年龄和计发月数。
- 多地缴费涉及待遇领取地规则，V1 不建议默认精算。
