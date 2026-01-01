const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, 'public/logo/infra-magician-logo.png');
  const outputPath = path.join(__dirname, 'public/logo/infra-magician-icon.png');
  
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log('Original image dimensions:', metadata.width, 'x', metadata.height);
    
    // Crop to remove text (top 60% of the image)
    const cropHeight = Math.floor(metadata.height * 0.60);
    
    await sharp(inputPath)
      .extract({ 
        left: 0, 
        top: 0, 
        width: metadata.width, 
        height: cropHeight 
      })
      // Remove white background (make transparent)
      .removeAlpha()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Process pixels to make white/light pixels transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // If pixel is close to white, make it transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Set alpha to 0
          }
        }
        
        return sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        })
        .resize(1024, 1024, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .modulate({
          saturation: 1.5,  // Increase saturation by 50%
          brightness: 1.1   // Increase brightness by 10%
        })
        .png()
        .toFile(outputPath);
      });
    
    console.log('✓ Logo processed successfully!');
    console.log('  Output:', outputPath);
  } catch (error) {
    console.error('Error processing logo:', error);
  }
}

processLogo();

