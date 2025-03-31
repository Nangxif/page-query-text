// 以release-template.yml为模板，生成release.yml
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const version = require('../package.json').version;

// 读取release-template.yml
const template = fs.readFileSync(
  path.join(__dirname, 'release-template.yml'),
  'utf-8',
);

// 替换[[version]]
const releaseYml = template.replaceAll('[[version]]', version);

// 写入/.github/workflows
fs.writeFileSync(
  path.join(__dirname, '../.github/workflows/release.yml'),
  releaseYml,
);
