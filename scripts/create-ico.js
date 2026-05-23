const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = path.join(__dirname, '../resources/icons/logo.png');
const outputPath = path.join(__dirname, '../resources/icons/logo.ico');

async function createIco() {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const images = [];

  for (const size of sizes) {
    const buffer = await sharp(inputPath)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();
    images.push({ size, buffer });
  }

  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = images.length;
  let dataOffset = headerSize + (dirEntrySize * numImages);

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  const imageData = [];

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(dataOffset, 12);

    dirEntries.push(entry);
    imageData.push(img.buffer);
    dataOffset += img.buffer.length;
  }

  const ico = Buffer.concat([header, ...dirEntries, ...imageData]);
  fs.writeFileSync(outputPath, ico);
  console.log(`ICO created: ${outputPath}`);
}

createIco().catch(console.error);