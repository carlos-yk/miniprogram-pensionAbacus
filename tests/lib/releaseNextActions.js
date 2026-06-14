const {
  getLatestWatchedContentChange,
  requiredCheckLabels,
  requiredChecks,
  requiredPlatforms
} = require('./deviceQaEvidence');

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

const DEVICE_QA_COMPLETE_COMMAND = [
  'npm run qa:device-evidence:complete --',
  '--tester "测试人姓名"',
  '--ios-model "iPhone 机型"',
  '--ios-os "iOS 版本"',
  '--ios-wechat "微信版本"',
  '--ios-screenshot "qa/artifacts/ios-main-flow.png"',
  '--android-model "Android 机型"',
  '--android-os "Android 版本"',
  '--android-wechat "微信版本"',
  '--android-screenshot "qa/artifacts/android-main-flow.png"',
  '--confirm-real-device'
].join(' ');

function buildReleaseNextActions({
  assetIssues,
  cityDataIssues,
  dataBackfillSummary,
  devtoolsIssues,
  deviceQaIssues,
  supportFileIssues,
  worktreeIssues
}) {
  const actions = [];

  const supportMissing = (supportFileIssues && supportFileIssues.missing) || [];
  const supportUntracked = (supportFileIssues && supportFileIssues.untracked) || [];
  const supportModified = (supportFileIssues && supportFileIssues.modified) || [];
  const assetModified = assetIssues.modified || [];
  const worktreeModified = (worktreeIssues && worktreeIssues.modified) || [];
  const worktreeUntracked = (worktreeIssues && worktreeIssues.untracked) || [];

  if (
    assetIssues.untracked.length > 0 ||
    assetModified.length > 0 ||
    assetIssues.missing.length > 0 ||
    assetIssues.invalid.length > 0 ||
    supportMissing.length > 0 ||
    supportUntracked.length > 0 ||
    supportModified.length > 0 ||
    worktreeModified.length > 0 ||
    worktreeUntracked.length > 0
  ) {
    const filesToTrack = unique([
      ...assetIssues.untracked,
      ...assetModified,
      ...supportUntracked,
      ...supportModified,
      ...worktreeModified,
      ...worktreeUntracked
    ]);

    actions.push({
      owner: 'git',
      priority: 'P0',
      title: '跟踪发布资产和发布支持文件',
      reason: '发布包依赖的图片、清单、QA 模板和发布校验脚本必须进入版本控制，避免线上包缺图或发布闸门丢失。',
      blockers: [
        ...assetIssues.missing.map((item) => `缺少资产：${item}`),
        ...assetIssues.untracked.map((item) => `未纳入 git：${item}`),
        ...assetModified.map((item) => `发布资产有本地未提交改动：${item}`),
        ...assetIssues.invalid,
        ...supportMissing.map((item) => `缺少发布支持文件：${item}`),
        ...supportUntracked.map((item) => `发布支持文件未纳入 git：${item}`),
        ...supportModified.map((item) => `发布支持文件有本地未提交改动：${item}`),
        ...worktreeModified.map((item) => `发布工作区有本地未提交改动：${item}`),
        ...worktreeUntracked.map((item) => `发布工作区有未跟踪文件：${item}`)
      ],
      command: filesToTrack.length > 0 ? `git add ${filesToTrack.join(' ')}` : null
    });
  }

  if (cityDataIssues.blockers.length > 0) {
    actions.push({
      owner: 'data',
      priority: 'P0',
      title: '补齐并复核上海首开数据',
      reason: '上海未达到公开测算门槛前，普通用户不能提交测算。',
      blockers: cityDataIssues.blockers,
      taskCount: dataBackfillSummary.totalTasks,
      taskSummary: dataBackfillSummary.byType,
      visibleTasks: dataBackfillSummary.visibleTasks,
      remainingHiddenTasks: dataBackfillSummary.remainingHiddenTasks,
      reportPath: dataBackfillSummary.reportPath,
      targetFiles: unique(dataBackfillSummary.visibleTasks.flatMap((task) => task.targetFiles || [])),
      commands: [
        'npm run data:backfill-tasks',
        'npm run verify:data-readiness'
      ]
    });
  }

  const qaBlockers = [
    ...((devtoolsIssues && devtoolsIssues.blockers) || []),
    ...deviceQaIssues.blockers
  ];
  const qaWarnings = [
    ...((devtoolsIssues && devtoolsIssues.warnings) || []),
    ...deviceQaIssues.warnings
  ];

  if (qaBlockers.length > 0 || qaWarnings.length > 0) {
    const latestChange = getLatestWatchedContentChange();

    actions.push({
      owner: 'qa',
      priority: 'P0',
      title: '完成微信开发者工具预览与真机验收',
      reason: '小程序发布前必须在非沙盒、已登录微信开发者工具环境生成预览并完成 iOS/Android 真机主流程。',
      blockers: qaBlockers,
      warnings: qaWarnings,
      commands: ['npm run verify:devtools:preview', 'npm run verify:device-qa'],
      loginHelperCommand: 'npm run qa:devtools-login',
      loginCommand: devtoolsIssues && devtoolsIssues.loginCommand,
      previewCommand: devtoolsIssues && devtoolsIssues.previewCommand,
      draftCommand: 'npm run qa:device-evidence:init',
      completeCommand: DEVICE_QA_COMPLETE_COMMAND,
      evidencePath: deviceQaIssues.evidencePath,
      examplePath: deviceQaIssues.examplePath,
      artifactRequirements: ['devtools.qrOutput', 'devtools.infoOutput', 'device.screenshot'],
      requiredPlatforms,
      requiredChecks: requiredChecks.map((key) => ({
        key,
        label: requiredCheckLabels[key] || key
      })),
      evidenceMustBeLaterThan: latestChange
        ? {
          path: latestChange.path,
          mtimeIso: latestChange.mtimeIso
        }
        : null
    });
  }

  return actions;
}

function printReleaseNextActions(actions, logger = console.error) {
  if (!actions || actions.length === 0) return;

  logger('Release readiness next actions:');
  for (const action of actions) {
    logger(`- [${action.owner}/${action.priority}] ${action.title}`);
    logger(`  Reason: ${action.reason}`);

    if (action.command) {
      logger(`  Command: ${action.command}`);
    }
    if (action.commands && action.commands.length > 0) {
      logger(`  Commands: ${action.commands.join(' && ')}`);
    }
    if (action.loginHelperCommand) {
      logger(`  Login helper: ${action.loginHelperCommand}`);
    }
    if (action.loginCommand) {
      logger(`  Login command: ${action.loginCommand}`);
    }
    if (action.previewCommand) {
      logger(`  Preview command: ${action.previewCommand}`);
    }
    if (action.taskCount > 0) {
      logger(`  Tasks: ${action.taskCount} in ${action.reportPath}`);
      if (action.targetFiles && action.targetFiles.length > 0) {
        logger(`  Files: ${action.targetFiles.join(', ')}`);
      }
      for (const [type, count] of Object.entries(action.taskSummary || {})) {
        logger(`    - ${type}: ${count}`);
      }
      for (const task of action.visibleTasks || []) {
        logger(`    - ${task.id} - ${task.title}`);
      }
      if (action.remainingHiddenTasks > 0) {
        logger(`    - ${action.remainingHiddenTasks} more tasks in ${action.reportPath}`);
      }
    }
    if (action.evidencePath) {
      if (action.draftCommand) {
        logger(`  Evidence draft: ${action.draftCommand}`);
      }
      if (action.completeCommand) {
        logger(`  Evidence complete: ${action.completeCommand}`);
      }
      logger(`  Evidence: fill ${action.evidencePath} from ${action.examplePath}`);
    }
    if (action.artifactRequirements && action.artifactRequirements.length > 0) {
      logger(`  Artifacts: ${action.artifactRequirements.join(', ')} files must exist`);
    }
    if (action.evidenceMustBeLaterThan) {
      logger(`  Evidence time: later than ${action.evidenceMustBeLaterThan.path} (${action.evidenceMustBeLaterThan.mtimeIso})`);
    }
  }
}

module.exports = {
  buildReleaseNextActions,
  printReleaseNextActions
};
