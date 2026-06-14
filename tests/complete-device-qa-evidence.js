const fs = require('node:fs');
const path = require('node:path');

const {
  evidencePath,
  requiredChecks,
  requiredPlatforms
} = require('./lib/deviceQaEvidence');
const {
  defaultDevtoolsCliPath,
  getPreviewArgs,
  root
} = require('./lib/devtoolsPreconditions');

function printHelp() {
  console.log(`Usage: npm run qa:device-evidence:complete -- \\
  --tester NAME \\
  --ios-model MODEL --ios-os VERSION --ios-wechat VERSION --ios-screenshot PATH \\
  --android-model MODEL --android-os VERSION --android-wechat VERSION --android-screenshot PATH \\
  --confirm-real-device

Options:
  --output ${evidencePath}
  --tested-at ISO_DATE
  --qr-output PATH
  --info-output PATH`);
}

function getPreviewOutput(flagName) {
  const previewArgs = getPreviewArgs();
  const index = previewArgs.indexOf(flagName);
  return index >= 0 ? previewArgs[index + 1] : '';
}

function parseArgs(argv) {
  const options = {
    output: path.join(root, evidencePath),
    testedAt: new Date().toISOString(),
    qrOutput: getPreviewOutput('--qr-output'),
    infoOutput: getPreviewOutput('--info-output'),
    confirmRealDevice: false
  };
  const valueOptions = new Set([
    '--output',
    '--tested-at',
    '--tester',
    '--qr-output',
    '--info-output',
    '--ios-model',
    '--ios-os',
    '--ios-wechat',
    '--ios-screenshot',
    '--android-model',
    '--android-os',
    '--android-wechat',
    '--android-screenshot'
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--confirm-real-device') {
      options.confirmRealDevice = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    if (!valueOptions.has(arg)) {
      throw new Error(`Unknown argument: ${arg}`);
    }

    const value = argv[index + 1];
    if (!value) {
      throw new Error(`${arg} requires a value`);
    }
    const optionName = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    options[optionName] = value;
    index += 1;
  }

  options.output = path.isAbsolute(options.output)
    ? options.output
    : path.join(root, options.output);

  return options;
}

function isFilled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasPlaceholder(value) {
  return /^(name|iPhone|Android phone|iOS version|Android version|WeChat version)$/i.test(String(value || '').trim());
}

function assertRequiredOptions(options) {
  const required = [
    'tester',
    'qrOutput',
    'infoOutput',
    'iosModel',
    'iosOs',
    'iosWechat',
    'iosScreenshot',
    'androidModel',
    'androidOs',
    'androidWechat',
    'androidScreenshot'
  ];
  const missing = required.filter((key) => !isFilled(options[key]));

  if (missing.length > 0) {
    throw new Error(`Missing required options: ${missing.map((key) => `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`).join(', ')}`);
  }

  if (!Number.isFinite(Date.parse(options.testedAt))) {
    throw new Error(`--tested-at must be a valid ISO date string, got ${options.testedAt}`);
  }

  if (!options.confirmRealDevice) {
    throw new Error('Refusing to mark device QA as pass without --confirm-real-device after real iOS and Android validation.');
  }

  const placeholderFields = required.filter((key) => hasPlaceholder(options[key]));
  if (placeholderFields.length > 0) {
    throw new Error(`Refusing to mark device QA as pass with placeholder values: ${placeholderFields.join(', ')}`);
  }
}

function resolveArtifactPath(value) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function assertArtifactExists(label, artifactPath) {
  if (!fs.existsSync(resolveArtifactPath(artifactPath))) {
    throw new Error(`${label} file must exist: ${artifactPath}`);
  }
}

function readExistingEvidence(output) {
  if (!fs.existsSync(output)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(output, 'utf8'));
}

function buildDevice(platform, options) {
  if (platform === 'iOS') {
    return {
      platform,
      model: options.iosModel,
      osVersion: options.iosOs,
      wechatVersion: options.iosWechat,
      screenshot: options.iosScreenshot,
      result: 'pass'
    };
  }

  return {
    platform,
    model: options.androidModel,
    osVersion: options.androidOs,
    wechatVersion: options.androidWechat,
    screenshot: options.androidScreenshot,
    result: 'pass'
  };
}

function completeEvidence(options) {
  assertRequiredOptions(options);
  assertArtifactExists('devtools.qrOutput', options.qrOutput);
  assertArtifactExists('devtools.infoOutput', options.infoOutput);
  assertArtifactExists('iOS device screenshot', options.iosScreenshot);
  assertArtifactExists('Android device screenshot', options.androidScreenshot);

  const existing = readExistingEvidence(options.output);
  const checks = {};
  for (const check of requiredChecks) {
    checks[check] = true;
  }

  const evidence = {
    ...existing,
    schemaVersion: '1.0',
    releaseCity: existing.releaseCity || 'shanghai',
    testedAt: options.testedAt,
    tester: options.tester,
    devtools: {
      ...(existing.devtools || {}),
      cliPath: defaultDevtoolsCliPath,
      previewGenerated: true,
      qrOutput: options.qrOutput,
      infoOutput: options.infoOutput
    },
    devices: requiredPlatforms.map((platform) => buildDevice(platform, options)),
    checks,
    notes: 'Completed after real iOS and Android device QA. Re-run npm run verify:device-qa and npm run verify:release before release.'
  };

  fs.mkdirSync(path.dirname(options.output), { recursive: true });
  fs.writeFileSync(options.output, `${JSON.stringify(evidence, null, 2)}\n`);
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }
    completeEvidence(options);
  } catch (error) {
    console.error(error.message);
    printHelp();
    process.exit(1);
  }

  console.log(`Updated device QA evidence: ${options.output}`);
  console.log('Next steps:');
  console.log('- Run npm run verify:device-qa.');
  console.log('- Run npm run verify:release.');
}

main();
