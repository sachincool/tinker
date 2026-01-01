const sharp = require('sharp');
const path = require('path');

async function enhanceLogo() {
  const inputPath = path.join(__dirname, 'public/logo/infra-magician-logo.png');
  const outputPath = path.join(__dirname, 'public/logo/infra-magician-logo-enhanced.png');
  
  try {
    console.log('Enhancing logo for dark mode visibility...');
    
    // Get the original image
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log('Original dimensions:', metadata.width, 'x', metadata.height);
    
    // Create enhanced version with:
    // 1. Increased saturation for vibrant colors
    // 2. Increased brightness for better visibility
    // 3. Enhanced contrast
    await image
      .modulate({
        saturation: 1.8,  // Increase saturation by 80% for more vibrant colors
        brightness: 1.3,  // Increase brightness by 30%
      })
      .linear(1.2, 0)  // Increase contrast (multiply by 1.2)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log('✓ Enhanced logo created successfully!');
    console.log('  Input:', inputPath);
    console.log('  Output:', outputPath);
    console.log('\nEnhancements applied:');
    console.log('  - Saturation increased by 80%');
    console.log('  - Brightness increased by 30%');
    console.log('  - Contrast enhanced by 20%');
    console.log('\nNext steps:');
    console.log('  1. Check the enhanced logo at: public/logo/infra-magician-logo-enhanced.png');
    console.log('  2. If you like it, replace the original:');
    console.log('     mv public/logo/infra-magician-logo.png public/logo/infra-magician-logo-backup.png');
    console.log('     mv public/logo/infra-magician-logo-enhanced.png public/logo/infra-magician-logo.png');
    
  } catch (error) {
    console.error('Error enhancing logo:', error);
    process.exit(1);
  }
}

enhanceLogo();

