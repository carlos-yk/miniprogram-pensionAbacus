const { collectCityDataReadinessIssues } = require('./lib/cityDataReadiness');
const { collectDataBackfillTaskSummary } = require('./lib/dataBackfillTasks');

const targetCity = process.env.RELEASE_CITY || 'shanghai';
const { blockers, warnings } = collectCityDataReadinessIssues(targetCity);
const backfillSummary = collectDataBackfillTaskSummary({
  city: targetCity,
  priority: 'P0',
  limit: 6
});

function formatBackfillSummary(summary) {
  if (summary.totalTasks === 0) {
    return `Data backfill tasks for ${summary.city} (${summary.priority}): none`;
  }

  const lines = [
    `Data backfill tasks for ${summary.city} (${summary.priority}): ${summary.totalTasks}`,
    ...Object.entries(summary.byType).map(([type, count]) => `- ${type}: ${count}`),
    ...summary.visibleTasks.map((task) => `- ${task.id} - ${task.title}`)
  ];

  if (summary.remainingHiddenTasks > 0) {
    lines.push(`- ${summary.remainingHiddenTasks} more tasks in ${summary.reportPath}`);
  }

  return lines.join('\n');
}

if (blockers.length > 0 || warnings.length > 0) {
  if (blockers.length > 0) {
    console.error(`City data readiness blockers for ${targetCity}:\n${blockers.map((item) => `- ${item}`).join('\n')}`);
  }
  if (warnings.length > 0) {
    console.error(`City data readiness warnings:\n${warnings.map((item) => `- ${item}`).join('\n')}`);
  }
  console.error(formatBackfillSummary(backfillSummary));
  process.exit(blockers.length > 0 ? 1 : 0);
}

console.log(`OK city data readiness gates pass for ${targetCity}`);
