const { getCityGateOptions } = require('../../utils/dataGate');
const features = require('../../config/features');

function buildCityProgress() {
  return getCityGateOptions({
    internalPreview: features.internalPreviewEnabled,
    previewCities: features.previewCities
  }).map((gate) => {
    const canMeasure = gate.canSubmit || gate.canPreview;
    const label = gate.canSubmit ? '可测算' : (gate.previewLabel || '暂未开放');
    const summary = gate.canSubmit
      ? '已开放测算，结果仍以社保经办机构核定为准。'
      : (gate.previewMessage || '暂未开放测算。');

    return {
      city: gate.city,
      name: gate.name,
      label,
      tagClassName: canMeasure ? 'tag success' : 'tag warning',
      summary
    };
  });
}

Page({
  data: {
    cityProgress: buildCityProgress()
  }
});
