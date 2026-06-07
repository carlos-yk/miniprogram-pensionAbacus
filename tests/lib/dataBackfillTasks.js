const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const defaultTaskReportPath = 'data/generated/city-data-backfill-tasks.json';
const taskTypePriority = [
  'city-status-review',
  'backfill-year-params',
  'fill-missing-fields',
  'production-ready-review',
  'source-production-review',
  'source-backlog-review'
];

function readTaskReport(reportPath = defaultTaskReportPath) {
  const fullPath = path.join(root, reportPath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function selectRepresentativeTasks(tasks, limit) {
  if (limit <= 0) return [];
  if (tasks.length <= limit) return tasks;

  const selected = [];
  const selectedIds = new Set();

  for (const type of taskTypePriority) {
    const task = tasks.find((candidate) => candidate.type === type);
    if (!task || selectedIds.has(task.id)) continue;
    selected.push(task);
    selectedIds.add(task.id);
    if (selected.length === limit) return selected;
  }

  const localContributionSourceTask = tasks.find((task) =>
    task.type === 'source-production-review' &&
    /contribution-base/.test(task.sourceId || '') &&
    !selectedIds.has(task.id)
  );
  if (localContributionSourceTask) {
    selected.push(localContributionSourceTask);
    selectedIds.add(localContributionSourceTask.id);
    if (selected.length === limit) return selected;
  }

  for (const task of tasks) {
    if (selectedIds.has(task.id)) continue;
    selected.push(task);
    selectedIds.add(task.id);
    if (selected.length === limit) break;
  }

  return selected;
}

function mapVisibleTask(task) {
  return {
    id: task.id,
    title: task.title,
    type: task.type,
    year: task.year,
    sourceStatus: task.sourceStatus,
    sourceId: task.sourceId,
    requiredFields: task.requiredFields || [],
    sourceLeads: task.sourceLeads || {},
    targetFiles: task.targetFiles || [],
    verificationCommands: task.verificationCommands || [],
    acceptance: task.acceptance || [],
    notes: task.notes || ''
  };
}

function collectDataBackfillTaskSummary({
  city,
  priority = 'P0',
  limit = 6,
  reportPath = defaultTaskReportPath
} = {}) {
  const report = readTaskReport(reportPath);
  const targetCity = city || report.firstLaunchCity;
  const tasks = (report.tasks || []).filter((task) =>
    task.city === targetCity && task.priority === priority
  );
	  const byType = tasks.reduce((acc, task) => {
	    acc[task.type] = (acc[task.type] || 0) + 1;
	    return acc;
	  }, {});
	  const visibleTasks = selectRepresentativeTasks(tasks, limit).map(mapVisibleTask);

  return {
    city: targetCity,
    priority,
    totalTasks: tasks.length,
    byType,
    visibleTasks,
    remainingHiddenTasks: Math.max(0, tasks.length - visibleTasks.length),
    generatedAt: report.generatedAt,
    reportPath
  };
}

module.exports = {
  collectDataBackfillTaskSummary,
  selectRepresentativeTasks
};
