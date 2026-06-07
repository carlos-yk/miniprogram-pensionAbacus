const fs = require('node:fs');
const path = require('node:path');

const {
  evidencePath,
  examplePath,
  requiredChecks,
  requiredPlatforms
} = require('./lib/deviceQaEvidence');
const {
  defaultDevtoolsCliPath,
  getPreviewArgs,
  root
} = require('./lib/devtoolsPreconditions');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function parseArgs(argv) {
  const options = {
    output: path.join(root, evidencePath),
    testedAt: new Date().toISOString(),
    force: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--output' || arg === '--tested-at') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      options[arg === '--output' ? 'output' : 'testedAt'] = value;
      index += 1;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(Date.parse(options.testedAt))) {
    throw new Error(`--tested-at must be a valid ISO date string, got ${options.testedAt}`);
  }

  options.output = path.isAbsolute(options.output)
    ? options.output
    : path.join(root, options.output);
  return options;
}

function getPreviewOutput(flagName) {
  const previewArgs = getPreviewArgs();
  const index = previewArgs.indexOf(flagName);
  return index >= 0 ? previewArgs[index + 1] : '';
}

function createDraft(testedAt) {
  const template = readJson(examplePath);
  const checks = {};
  for (const check of requiredChecks) {
    checks[check] = false;
  }

  return {
    ...template,
    testedAt,
    devtools: {
      ...(template.devtools || {}),
      cliPath: defaultDevtoolsCliPath,
      previewGenerated: false,
      qrOutput: getPreviewOutput('--qr-output'),
      infoOutput: getPreviewOutput('--info-output')
    },
    devices: requiredPlatforms.map((platform) => {
      const templateDevice = (template.devices || []).find((device) => device.platform === platform) || {};
      return {
        ...templateDevice,
        platform,
        result: 'pending'
      };
    }),
    checks,
    notes: [
      'This file is a draft for real WeChat DevTools and device QA evidence.',
      'Set devtools.previewGenerated=true only after npm run verify:devtools:preview creates the QR and info files.',
      'Set each device result and checks.* item to pass/true only after validating it on real iOS and Android devices.',
      'Run npm run verify:device-qa after filling all fields and attaching screenshots.'
    ].join(' ')
  };
}

function printHelp() {
  console.log(`Usage: npm run qa:device-evidence:init -- [--output ${evidencePath}] [--tested-at ISO_DATE] [--force]`);
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    printHelp();
    process.exit(1);
  }

  if (options.help) {
    printHelp();
    return;
  }

  if (fs.existsSync(options.output) && !options.force) {
    console.error(`Device QA evidence draft already exists: ${options.output}`);
    console.error('Rerun with --force only if you intentionally want to replace it.');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(options.output), { recursive: true });
  fs.writeFileSync(options.output, `${JSON.stringify(createDraft(options.testedAt), null, 2)}\n`);

  console.log(`Created device QA evidence draft: ${options.output}`);
  console.log('Next steps:');
  console.log('- Run npm run verify:devtools:preview on a non-sandboxed, logged-in WeChat DevTools desktop.');
  console.log('- Scan the QR code on real iOS and Android devices, complete the main flow, and save screenshots.');
  console.log('- Fill tester, device details, device screenshot paths, result values, and checks.* only after real validation.');
  console.log('- Run npm run verify:device-qa.');
}

main();
