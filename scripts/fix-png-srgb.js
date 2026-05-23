const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const iconsDir = path.join(__dirname, '../resources/icons');

// Read all PNG files in the icons directory
fs.readdir(iconsDir, (err, files) => {
  if (err) {
    console.error('Error reading icons directory:', err);
    return;
  }

  const pngFiles = files.filter(file => file.endsWith('.png'));
  
  pngFiles.forEach(file => {
    const filePath = path.join(iconsDir, file);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`Error reading ${file}:`, err);
        return;
      }

      try {
        // Parse the PNG file
        const png = PNG.sync.read(data);
        
        // Remove iCCP chunk (sRGB profile)
        const cleanedData = PNG.sync.write(png, {
          colorType: png.colorType,
          bitDepth: png.bitDepth,
          width: png.width,
          height: png.height,
          deflateLevel: 9
        });

        // Write the cleaned data back
        fs.writeFile(filePath, cleanedData, (err) => {
          if (err) {
            console.error(`Error writing ${file}:`, err);
          } else {
            console.log(`Fixed sRGB profile in ${file}`);
          }
        });
      } catch (e) {
        console.error(`Error processing ${file}:`, e);
      }
    });
  });
});