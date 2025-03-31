// 压缩dist目录下的文件
// zip -r ../build-assets/page-query-text.zip .直接跑这段命令，把page-query-text加上版本号，版本号从package.json中获取
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const version = require('../package.json').version;
const zipName = `page-query-text-v${version}.zip`;
const zipPath = path.join(__dirname, '../build-assets', zipName);

// 压缩dist目录下的文件
const distDir = path.join(__dirname, '../dist');
const files = fs.readdirSync(distDir);

// 压缩文件
files.forEach((file) => {
  const filePath = path.join(distDir, file);
  if (fs.statSync(filePath).isFile()) {
    const zip = exec(`zip -r ${zipPath} ${filePath}`);
    zip.on('close', () => {
      console.log(`${filePath} 压缩完成`);
    });
  }
});
