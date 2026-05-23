const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 输入和输出路径
const inputPath = path.join(__dirname, '../resources/icons/logo.png');
const outputPath = path.join(__dirname, '../resources/icons/logo.ico');

console.log('正在生成 ICO 图标...');

async function createIcon() {
  try {
    // 使用 sharp 创建包含多个尺寸的 ICO 文件
    await sharp(inputPath)
      .resize(256, 256, { fit: 'cover', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(outputPath);
    
    console.log(`ICO 图标已生成: ${outputPath}`);
  } catch (error) {
    console.error('生成图标失败:', error);
    process.exit(1);
  }
}

createIcon();
