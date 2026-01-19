import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function generateNewsletterAsset() {
  console.log('🎨 Generating newsletter asset with Nano Banana...')

  const prompt = `Create a magical, whimsical illustration for a tech newsletter subscription:
- A cute wizard character (like a little mage with a pointy hat) 
- Surrounded by floating emails/envelopes with sparkles
- Color palette: purple, blue, pink gradients (matching a dark mode blog)
- Style: modern, slightly playful, tech-meets-magic aesthetic
- No text in the image
- Clean, minimal background that works on dark backgrounds
- Square aspect ratio`

  try {
    const result = await generateText({
      model: google('gemini-2.5-flash-image'),
      prompt,
      providerOptions: {
        google: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: '1:1' }
        }
      }
    })

    if (result.files && result.files[0]) {
      const file = result.files[0]
      const outputDir = join(process.cwd(), 'public', 'images')
      
      mkdirSync(outputDir, { recursive: true })
      
      const outputPath = join(outputDir, 'newsletter-wizard.png')
      writeFileSync(outputPath, Buffer.from(file.base64, 'base64'))
      
      console.log('✅ Generated newsletter asset:', outputPath)
      console.log('📁 Use in code as: /images/newsletter-wizard.png')
    } else {
      console.error('❌ No image generated')
      console.log('Result:', JSON.stringify(result, null, 2))
    }
  } catch (error) {
    console.error('❌ Generation failed:', error)
  }
}

generateNewsletterAsset()
