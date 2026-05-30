const { getCityGateOptions } = require('../../utils/dataGate');

function buildCityProgress() {
  return getCityGateOptions({ internalPreview: true }).map((gate) => {
    const enabled = gate.canSubmit || gate.canPreview;
    return {
      city: gate.city,
      name: gate.name,
      label: enabled ? '可试算' : '暂未开放',
      tagClassName: enabled ? 'tag success' : 'tag warning',
      summary: enabled ? '可先试算，结果仅供参考。' : '暂未开放测算。'
    };
  });
}

Page({
  data: {
    cityProgress: buildCityProgress()
  }
});
