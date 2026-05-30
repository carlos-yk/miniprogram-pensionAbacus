const workerTypes = [
  { key: 'female_original_55', label: '女性，约 55 岁退休' },
  { key: 'female_original_50', label: '女性，约 50 岁退休' },
  { key: 'male', label: '男性' },
  { key: 'female_unknown', label: '不确定，帮我算' }
];

const contributionOptions = [
  {
    key: 'floor',
    title: '不清楚，按当地最低档估算',
    desc: '适合不知道社保缴费基数的情况，结果范围会更宽。',
    input: { type: 'floor' }
  },
  {
    key: 'salary',
    title: '按税前月薪估算',
    desc: '系统会按当地缴费上下限处理。',
    needsAmount: true,
    amountPlaceholder: '请输入税前月薪',
    inputType: 'salary'
  },
  {
    key: 'base',
    title: '我知道社保缴费基数',
    desc: '结果会比按工资估算更接近。',
    needsAmount: true,
    amountPlaceholder: '请输入社保缴费基数',
    inputType: 'base'
  },
  {
    key: 'ratio_60',
    title: '按社平工资 60%',
    desc: '接近常见最低缴费档。',
    input: { type: 'ratio', contributionIndex: 0.6 }
  },
  {
    key: 'ratio_100',
    title: '按社平工资 100%',
    desc: '接近平均缴费水平。',
    input: { type: 'ratio', contributionIndex: 1 }
  },
  {
    key: 'ratio_150',
    title: '按社平工资 150%',
    desc: '高于平均缴费水平。',
    input: { type: 'ratio', contributionIndex: 1.5 }
  },
  {
    key: 'ratio_300',
    title: '按社平工资 300%',
    desc: '接近缴费上限。',
    input: { type: 'ratio', contributionIndex: 3 }
  }
];

function cloneOptions(options) {
  return options.map((option) => ({
    ...option,
    input: option.input ? { ...option.input } : undefined
  }));
}

function getWorkerTypes() {
  return cloneOptions(workerTypes);
}

function getContributionOptions() {
  return cloneOptions(contributionOptions);
}

function getPrimaryContributionOptions() {
  return cloneOptions(contributionOptions.slice(0, 3));
}

function getAdvancedContributionOptions() {
  return cloneOptions(contributionOptions.slice(3));
}

module.exports = {
  getAdvancedContributionOptions,
  getContributionOptions,
  getPrimaryContributionOptions,
  getWorkerTypes
};
