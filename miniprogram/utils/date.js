function parseYearMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw new Error(`Invalid year-month: ${value}`);
  }

  const [year, month] = value.split('-').map(Number);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month in year-month: ${value}`);
  }

  return { year, month };
}

function toMonthIndex(value) {
  const { year, month } = parseYearMonth(value);
  return year * 12 + (month - 1);
}

function fromMonthIndex(index) {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function addMonths(value, months) {
  return fromMonthIndex(toMonthIndex(value) + months);
}

function monthsBetween(fromInclusive, toMonth) {
  return toMonthIndex(toMonth) - toMonthIndex(fromInclusive);
}

function getYear(value) {
  return parseYearMonth(value).year;
}

function formatAge(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) {
    return `${years}岁`;
  }

  return `${years}岁${months}个月`;
}

module.exports = {
  addMonths,
  formatAge,
  fromMonthIndex,
  getYear,
  monthsBetween,
  parseYearMonth,
  toMonthIndex
};
