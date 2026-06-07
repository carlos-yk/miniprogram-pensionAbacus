const {
  cityParams,
  cityHistoryCoverage,
  cityHistoryParams
} = require('../../miniprogram/data/runtime-data');
const sourceCatalog = require('../../data/official/sources.json');

const defaultReleaseCity = 'shanghai';
const requiredReviewStatus = 'production_ready';

function formatYears(years) {
  if (!years || years.length === 0) return 'none';
  const sorted = years.slice().sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let index = 1; index < sorted.length; index += 1) {
    const year = sorted[index];
    if (year === prev + 1) {
      prev = year;
      continue;
    }

    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = year;
    prev = year;
  }

  ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
  return ranges.join(', ');
}

function rangeYears(range) {
  if (!range || typeof range.from !== 'number' || typeof range.to !== 'number') return [];
  const years = [];
  for (let year = range.from; year <= range.to; year += 1) {
    years.push(year);
  }
  return years;
}

function getReadinessYearRange(coverage) {
  if (coverage && coverage.publicSupportedYearRange) {
    return rangeYears(coverage.publicSupportedYearRange);
  }
  return rangeYears(cityHistoryCoverage.targetYearRange);
}

function collectSourceIds(value, sourceIds = new Set()) {
  if (!value || typeof value !== 'object') return sourceIds;

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSourceIds(item, sourceIds);
    }
    return sourceIds;
  }

  if (Array.isArray(value.sourceIds)) {
    for (const sourceId of value.sourceIds) {
      if (sourceId) sourceIds.add(sourceId);
    }
  }

  for (const child of Object.values(value)) {
    collectSourceIds(child, sourceIds);
  }

  return sourceIds;
}

function getSourceById(sources = sourceCatalog) {
  return new Map((sources.sources || []).map((source) => [source.sourceId, source]));
}

function collectReferencedSourceIssues(yearlyParams, sources = sourceCatalog) {
  const blockers = [];
  const sourceById = getSourceById(sources);
  const referencedSourceIds = collectSourceIds(yearlyParams);

  for (const sourceId of Array.from(referencedSourceIds).sort()) {
    const source = sourceById.get(sourceId);
    if (!source) {
      blockers.push(`Referenced source ${sourceId} is missing from data/official/sources.json`);
      continue;
    }

    const status = source.review && source.review.status;
    if (status !== requiredReviewStatus) {
      blockers.push(`Referenced source ${sourceId} review status is ${status || 'missing'}, expected ${requiredReviewStatus}`);
    }
  }

  return blockers;
}

function collectCityDataReadinessIssues(city = defaultReleaseCity) {
  const blockers = [];
  const warnings = [];
  const cityParam = cityParams.cities[city];
  const coverage = cityHistoryCoverage.cities[city];
  const history = cityHistoryParams.cities[city];
  const targetYears = getReadinessYearRange(coverage);

  if (!cityParam) {
    blockers.push(`City params missing for ${city}`);
  } else if (cityParam.status !== 'ready') {
    blockers.push(`City status is ${cityParam.status}, expected ready`);
  }

  if (!coverage) {
    blockers.push(`History coverage missing for ${city}`);
  } else {
    const partialYears = coverage.partialYears || [];
    const missingYears = coverage.missingYears || [];
    const completeYears = coverage.officialCompleteYears || [];
    const expectedYears = targetYears.length > 0 ? targetYears : completeYears.concat(partialYears, missingYears);
    const completeSet = new Set(completeYears);
    const uncoveredYears = expectedYears.filter((year) => !completeSet.has(year));
    const targetSet = new Set(expectedYears);
    const outOfRangePartialYears = partialYears.filter((year) => !targetSet.has(year));
    const inRangePartialYears = partialYears.filter((year) => targetSet.has(year));
    const inRangeMissingYears = missingYears.filter((year) => targetSet.has(year));

    if (inRangePartialYears.length > 0) {
      blockers.push(`Partial history years remain in supported range: ${formatYears(inRangePartialYears)}`);
    }

    if (inRangeMissingYears.length > 0) {
      blockers.push(`Missing history years remain in supported range: ${formatYears(inRangeMissingYears)}`);
    }

    if (uncoveredYears.length > 0) {
      blockers.push(`Supported range is not fully complete: ${formatYears(uncoveredYears)}`);
    }

    if (coverage.publicSupportedYearRange && outOfRangePartialYears.length > 0) {
      warnings.push(`Historical backlog outside public supported range: ${formatYears(outOfRangePartialYears)}`);
    }
  }

  if (!history || !Array.isArray(history.yearlyParams)) {
    blockers.push(`Yearly history params missing for ${city}`);
  } else {
    const yearlyByYear = new Map(history.yearlyParams.map((item) => [item.year, item]));
    const targetSet = new Set(targetYears);
    const missingParamYears = targetYears.filter((year) => !yearlyByYear.has(year));
    const missingFieldsByField = new Map();
    const nonReadyYears = [];

    if (missingParamYears.length > 0) {
      blockers.push(`Yearly param objects missing: ${formatYears(missingParamYears)}`);
    }

    for (const param of history.yearlyParams) {
      if (targetYears.length > 0 && !targetSet.has(param.year)) {
        continue;
      }

      const quality = param.dataQuality || {};
      const missingFields = quality.missingFields || [];

      if (quality.reviewStatus !== requiredReviewStatus) {
        nonReadyYears.push(param.year);
      }

      for (const field of missingFields) {
        const years = missingFieldsByField.get(field) || [];
        years.push(param.year);
        missingFieldsByField.set(field, years);
      }
    }

    if (nonReadyYears.length > 0) {
      blockers.push(`Yearly params not marked production ready: ${formatYears(nonReadyYears)}`);
    }

    for (const [field, years] of missingFieldsByField.entries()) {
      blockers.push(`Missing required field ${field}: ${formatYears(years)}`);
    }

    blockers.push(...collectReferencedSourceIssues(
      targetYears.length > 0
        ? history.yearlyParams.filter((item) => targetSet.has(item.year))
        : history.yearlyParams
    ));
  }

  if (city !== defaultReleaseCity) {
    warnings.push(`RELEASE_CITY is ${city}; first launch city is expected to be shanghai unless product decision changes`);
  }

  return {
    city,
    blockers,
    warnings
  };
}

module.exports = {
  collectCityDataReadinessIssues,
  collectReferencedSourceIssues,
  defaultReleaseCity,
  formatYears
};
