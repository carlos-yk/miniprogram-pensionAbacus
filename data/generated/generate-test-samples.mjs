import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const generatedDir = path.join(root, "data/generated");
const require = createRequire(import.meta.url);
const { calculatePensionEstimate } = require("../../miniprogram/utils/pensionCalculator");

const retirementRules = JSON.parse(
  fs.readFileSync(path.join(root, "data/official/retirement-age-rules.json"), "utf8"),
);
const payoutMonths = JSON.parse(
  fs.readFileSync(path.join(root, "data/official/payout-months.json"), "utf8"),
);

const MONTH_ZERO_BASED = 1;

function toMonthIndex(ym) {
  const [year, month] = ym.split("-").map(Number);
  return year * 12 + month - MONTH_ZERO_BASED;
}

function fromMonthIndex(index) {
  const year = Math.floor(index / 12);
  const month = (index % 12) + MONTH_ZERO_BASED;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function addMonths(ym, months) {
  return fromMonthIndex(toMonthIndex(ym) + months);
}

function monthsBetween(fromYm, toYm) {
  return toMonthIndex(toYm) - toMonthIndex(fromYm);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function findRetirementRule(workerType) {
  const rule = retirementRules.rules.find((item) => item.workerType === workerType);
  if (!rule) {
    throw new Error(`Unknown workerType: ${workerType}`);
  }
  return rule;
}

function calculateRetirement(workerType, birthMonth) {
  const rule = findRetirementRule(workerType);
  const originalAgeMonths =
    rule.originalRetirementAge.years * 12 + rule.originalRetirementAge.months;
  const originalRetirementMonth = addMonths(birthMonth, originalAgeMonths);
  const policyStartMonth = "2025-01";
  const rawDeltaFromPolicyStart = monthsBetween(policyStartMonth, originalRetirementMonth);
  const delayMonths =
    rawDeltaFromPolicyStart < 0
      ? 0
      : clamp(
          Math.floor(rawDeltaFromPolicyStart / rule.delayPolicy.stepMonths) +
            rule.delayPolicy.delayMonthsPerStep,
          0,
          rule.delayPolicy.maxDelayMonths,
        );
  const retirementAgeMonths = originalAgeMonths + delayMonths;
  const retirementAgeYears = Math.floor(retirementAgeMonths / 12);
  const retirementAgeRemainderMonths = retirementAgeMonths % 12;
  const retirementMonth = addMonths(originalRetirementMonth, delayMonths);
  const payoutAgeYears = retirementAgeYears;

  return {
    originalRetirementMonth,
    delayMonths,
    retirementMonth,
    retirementYear: Number(retirementMonth.slice(0, 4)),
    retirementAge: {
      years: retirementAgeYears,
      months: retirementAgeRemainderMonths,
      totalMonths: retirementAgeMonths,
    },
    payoutAgeYears,
    payoutMonths: payoutMonths.monthsByRetirementAge[String(payoutAgeYears)] ?? null,
  };
}

function requiredContributionMonths(retirementYear) {
  const firstRule = retirementRules.minimumContributionYearsByRetirementYear[0];
  if (retirementYear < firstRule.retirementYearFrom) {
    return 15 * 12;
  }

  const row = retirementRules.minimumContributionYearsByRetirementYear.find((item) => {
    const to = item.retirementYearTo ?? Infinity;
    return retirementYear >= item.retirementYearFrom && retirementYear <= to;
  });
  if (!row) {
    throw new Error(`No minimum contribution rule for retirementYear: ${retirementYear}`);
  }
  return row.requiredYears * 12 + row.requiredMonths;
}

function listMonths(fromYm, toYm) {
  const start = toMonthIndex(fromYm);
  const end = toMonthIndex(toYm);
  const result = [];
  for (let i = start; i <= end; i += 1) {
    result.push(fromMonthIndex(i));
  }
  return result;
}

const workerProfiles = [
  {
    workerType: "male",
    label: "男职工",
    representativeBirthMonths: ["1964-12", "1965-01", "1976-12", "1977-01"],
  },
  {
    workerType: "female_original_55",
    label: "原55岁女职工",
    representativeBirthMonths: ["1969-12", "1970-01", "1981-12", "1982-01"],
  },
  {
    workerType: "female_original_50",
    label: "原50岁女职工",
    representativeBirthMonths: ["1974-12", "1975-01", "1984-12", "1985-01"],
  },
];

const mvpWorkerProfiles = [
  {
    workerType: "male",
    label: "男职工",
    representativeBirthMonths: ["1968-06"],
  },
  {
    workerType: "female_original_55",
    label: "原55岁女职工",
    representativeBirthMonths: ["1973-06"],
  },
  {
    workerType: "female_original_50",
    label: "原50岁女职工",
    representativeBirthMonths: ["1978-06"],
  },
];

const cities = [
  { city: "shanghai", cityName: "上海" },
  { city: "beijing", cityName: "北京" },
  { city: "shenzhen", cityName: "深圳" },
];

const contributionProfiles = [
  {
    key: "below_minimum",
    label: "缴费年限不足",
    paidMonths: 14 * 12 + 11,
    expectedEligibilityHint: "should_fail_before_2029_minimum",
  },
  {
    key: "minimum_15y",
    label: "刚满15年",
    paidMonths: 15 * 12,
    expectedEligibilityHint: "should_pass_before_2030_only",
  },
  {
    key: "minimum_20y",
    label: "刚满20年",
    paidMonths: 20 * 12,
    expectedEligibilityHint: "should_pass_after_2039_minimum",
  },
  {
    key: "standard_30y",
    label: "常见30年",
    paidMonths: 30 * 12,
    expectedEligibilityHint: "should_pass",
  },
  {
    key: "long_40y",
    label: "长缴40年",
    paidMonths: 40 * 12,
    expectedEligibilityHint: "should_pass",
  },
];

const mvpContributionProfiles = contributionProfiles.filter((profile) =>
  ["below_minimum", "minimum_15y", "standard_30y", "long_40y"].includes(profile.key),
);

const wageProfiles = [
  {
    key: "floor",
    label: "按当地缴费下限",
    contributionIndex: 0.6,
    currentMonthlySalaryInput: null,
    contributionBaseInputType: "ratio",
  },
  {
    key: "average",
    label: "按社平工资附近",
    contributionIndex: 1,
    currentMonthlySalaryInput: null,
    contributionBaseInputType: "ratio",
  },
  {
    key: "above_average",
    label: "高于平均",
    contributionIndex: 1.5,
    currentMonthlySalaryInput: null,
    contributionBaseInputType: "ratio",
  },
  {
    key: "ceiling",
    label: "按缴费上限",
    contributionIndex: 3,
    currentMonthlySalaryInput: null,
    contributionBaseInputType: "ratio",
  },
];

const mvpWageProfiles = wageProfiles.filter((profile) =>
  ["floor", "average", "ceiling"].includes(profile.key),
);

const accountProfiles = [
  {
    key: "unknown_balance",
    label: "不知道个人账户余额",
    knownPersonalAccountBalance: false,
    personalAccountBalance: null,
    expectedAccuracyImpact: "lower_accuracy_use_estimation",
  },
  {
    key: "known_balance",
    label: "已知个人账户余额",
    knownPersonalAccountBalance: true,
    personalAccountBalance: 180000,
    expectedAccuracyImpact: "higher_accuracy_use_user_input",
  },
];

const transitionProfiles = [
  {
    key: "no_transition",
    label: "无早年工作经历",
    hasPreReformWorkHistory: false,
    expectedTransitionHandling: "not_applicable",
  },
  {
    key: "has_transition_hint",
    label: "有早年工作经历",
    hasPreReformWorkHistory: true,
    expectedTransitionHandling: "show_transition_pension_accuracy_warning",
  },
];

function buildRetirementAgeCases() {
  const cases = [];
  for (const rule of retirementRules.rules) {
    const birthMonths = [
      addMonths(rule.unaffectedBirthBefore, -1),
      ...listMonths(rule.tableBirthRange.from, rule.tableBirthRange.to),
      rule.fullyDelayedBirthFrom,
    ];

    for (const birthMonth of birthMonths) {
      const expected = calculateRetirement(rule.workerType, birthMonth);
      cases.push({
        caseId: `ret_age_${rule.workerType}_${birthMonth}`,
        workerType: rule.workerType,
        birthMonth,
        expected,
      });
    }
  }
  return cases;
}

function buildCalculationCases({
  profiles = workerProfiles,
  contributions = contributionProfiles,
  wages = wageProfiles,
  accounts = accountProfiles,
  includeTransitionCases = true,
  caseIdPrefix = "calc",
} = {}) {
  const cases = [];
  let index = 1;

  for (const city of cities) {
    for (const worker of profiles) {
      for (const birthMonth of worker.representativeBirthMonths) {
        for (const contribution of contributions) {
          for (const wage of wages) {
            for (const account of accounts) {
              const retirement = calculateRetirement(worker.workerType, birthMonth);
              const requiredMonths = requiredContributionMonths(retirement.retirementYear);
              cases.push({
                caseId: `${caseIdPrefix}_${String(index).padStart(4, "0")}`,
                title: `${city.cityName}-${worker.label}-${birthMonth}-${contribution.label}-${wage.label}-${account.label}`,
                tags: [
                  city.city,
                  worker.workerType,
                  contribution.key,
                  wage.key,
                  account.key,
                ],
                inputs: {
                  city: city.city,
                  workerType: worker.workerType,
                  birthMonth,
                  paidMonths: contribution.paidMonths,
                  contributionInput: {
                    type: wage.contributionBaseInputType,
                    contributionIndex: wage.contributionIndex,
                    currentMonthlySalary: wage.currentMonthlySalaryInput,
                  },
                  personalAccount: {
                    known: account.knownPersonalAccountBalance,
                    balance: account.personalAccountBalance,
                  },
                },
                expectedAssertions: {
                  retirement,
                  requiredContributionMonths: requiredMonths,
                  contributionEligible: contribution.paidMonths >= requiredMonths,
                  expectedEligibilityHint: contribution.expectedEligibilityHint,
                  expectedAccuracyImpact: account.expectedAccuracyImpact,
                  shouldReturnAmountBreakdown: true,
                  shouldReturnAccuracyLevel: true,
                  shouldReturnDataQualityWarnings: true,
                },
              });
              index += 1;
            }
          }
        }
      }
    }
  }

  if (!includeTransitionCases) {
    return cases;
  }

  for (const city of cities) {
    for (const transition of transitionProfiles) {
      const retirement = calculateRetirement("male", "1964-12");
      const requiredMonths = requiredContributionMonths(retirement.retirementYear);
      cases.push({
        caseId: `${caseIdPrefix}_${String(index).padStart(4, "0")}`,
        title: `${city.cityName}-${transition.label}-过渡性养老金提示`,
        tags: [city.city, "transition_pension", transition.key],
        inputs: {
          city: city.city,
          workerType: "male",
          birthMonth: "1964-12",
          paidMonths: 40 * 12,
          contributionInput: {
            type: "ratio",
            contributionIndex: 1,
            currentMonthlySalary: null,
          },
          personalAccount: {
            known: false,
            balance: null,
          },
          hasPreReformWorkHistory: transition.hasPreReformWorkHistory,
        },
        expectedAssertions: {
          retirement,
          requiredContributionMonths: requiredMonths,
          contributionEligible: true,
          expectedTransitionHandling: transition.expectedTransitionHandling,
          shouldReturnAmountBreakdown: true,
          shouldReturnAccuracyLevel: true,
          shouldReturnDataQualityWarnings: true,
        },
      });
      index += 1;
    }
  }

  return cases;
}

const retirementAgeCases = buildRetirementAgeCases();
const calculationCases = buildCalculationCases();
const mvpCalculationCases = buildCalculationCases({
  profiles: mvpWorkerProfiles,
  contributions: mvpContributionProfiles,
  wages: mvpWageProfiles,
  accounts: accountProfiles,
  includeTransitionCases: false,
  caseIdPrefix: "mvp_calc",
});
const shanghaiAmountCases = calculationCases
  .filter((item) => item.inputs.city === "shanghai")
  .map((item) => {
    const result = calculatePensionEstimate(item.inputs);
    return {
      ...item,
      expected: {
        amount: result.amount,
        breakdown: result.breakdown,
        contribution: result.contribution,
        eligibility: result.eligibility,
      },
    };
  });

const commonMeta = {
  schemaVersion: "1.0",
  generatedAt: "2026-05-28",
  generator: "data/generated/generate-test-samples.mjs",
  status: "generated_pending_formula_expected_amounts",
};

fs.writeFileSync(
  path.join(generatedDir, "retirement-age-test-cases.json"),
  `${JSON.stringify(
    {
      ...commonMeta,
      description:
        "渐进式延迟退休年龄规则穷举样例。覆盖政策前一个月、政策表区间全部出生月份、完全延迟后的第一个出生月份。",
      sourceData: ["data/official/retirement-age-rules.json", "data/official/payout-months.json"],
      caseCount: retirementAgeCases.length,
      cases: retirementAgeCases,
    },
    null,
    2,
  )}\n`,
);

fs.writeFileSync(
  path.join(generatedDir, "calculation-test-samples.json"),
  `${JSON.stringify(
    {
      ...commonMeta,
      description:
        "城镇职工基本养老保险扩展测算输入矩阵。用于后续回归测试，覆盖更多边界和提示场景；MVP 开发优先使用 calculation-mvp-test-samples.json。",
      sourceData: [
        "data/official/retirement-age-rules.json",
        "data/official/payout-months.json",
        "data/official/city-key-params-2015-2025.json",
      ],
      generationDimensions: {
        cities,
        workerProfiles,
        contributionProfiles,
        wageProfiles,
        accountProfiles,
        transitionProfiles,
      },
      caseCount: calculationCases.length,
      notes: [
        "当前样例只校验输入组合、退休年龄、计发月数、最低缴费年限、资格判断和提示逻辑。",
        "养老金金额 expected values 需等公式实现和记账利率策略确定后再生成。",
        "带小数月退休年龄时，计发月数暂按退休年龄整数年向下取整选择，正式上线前需做政策复核。",
      ],
      cases: calculationCases,
    },
    null,
    2,
  )}\n`,
);

fs.writeFileSync(
  path.join(generatedDir, "calculation-mvp-test-samples.json"),
  `${JSON.stringify(
    {
      ...commonMeta,
      description:
        "城镇职工基本养老保险 MVP 测算输入矩阵。只覆盖单城市、正常退休、常规缴费、个人账户余额已知/未知等第一版主流程。",
      sourceData: [
        "data/official/retirement-age-rules.json",
        "data/official/payout-months.json",
        "data/official/city-key-params-2015-2025.json",
      ],
      generationDimensions: {
        cities,
        workerProfiles: mvpWorkerProfiles,
        contributionProfiles: mvpContributionProfiles,
        wageProfiles: mvpWageProfiles,
        accountProfiles,
      },
      caseCount: mvpCalculationCases.length,
      mvpScope: {
        included: [
          "单城市测算",
          "正常城镇职工退休年龄",
          "已缴费年限不足、15年、30年、40年",
          "缴费下限、社平附近、缴费上限",
          "个人账户余额未知和已知",
        ],
        excluded: [
          "多地缴费待遇领取地判断",
          "特殊工种提前退休",
          "病退",
          "机关事业单位养老",
          "城乡居民养老",
          "企业年金和职业年金",
          "过渡性养老金精算",
          "竞争力分数",
        ],
      },
      notes: [
        "MVP 样例用于第一版开发和冒烟回归。",
        "扩展边界样例保留在 calculation-test-samples.json，后续迭代再启用。",
        "养老金金额 expected values 需等公式实现和记账利率策略确定后再生成。",
      ],
      cases: mvpCalculationCases,
    },
    null,
    2,
  )}\n`,
);

fs.writeFileSync(
  path.join(generatedDir, "shanghai-amount-expected-values.json"),
  `${JSON.stringify(
    {
      ...commonMeta,
      status: "generated_amounts_verified_by_current_calculator",
      city: "shanghai",
      cityName: "上海",
      description:
        "上海金额 expected values 穷举样本。覆盖 calculation-test-samples.json 中全部上海输入组合，并记录当前养老金估算器输出的金额、分解、缴费和资格结果。",
      sourceData: [
        "data/official/city-history-params.json",
        "data/official/retirement-age-rules.json",
        "data/official/payout-months.json",
      ],
      formulaSnapshot: {
        calculator: "miniprogram/utils/pensionCalculator.js",
        currentMonth: "2026-05",
        note:
          "当前 expected values 用于回归锁定现有 V1 快速估算公式；后续引入逐年历史缴费展开、记账利率或过渡性养老金时应重新生成并复核。",
      },
      caseCount: shanghaiAmountCases.length,
      cases: shanghaiAmountCases,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    {
      retirementAgeCaseCount: retirementAgeCases.length,
      calculationCaseCount: calculationCases.length,
      mvpCalculationCaseCount: mvpCalculationCases.length,
      shanghaiAmountCaseCount: shanghaiAmountCases.length,
    },
    null,
    2,
  ),
);
