const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateAppIcon() {
    const inputLogoPath = path.resolve('..', 'cianjurkablogo.png');
    const outputIconPath = path.resolve('assets', 'icon.png');
    const outputAdaptiveIconPath = path.resolve('assets', 'adaptive-icon.png');
    const outputSplashPath = path.resolve('assets', 'splash-icon.png');
    const outputFaviconPath = path.resolve('assets', 'favicon.png');

    const width = 1024;
    const height = 1024;

    // Resize logo to fit inside the icon (leave room for text)
    const logoSize = 600;
    
    // Check if input logo exists
    if (!fs.existsSync(inputLogoPath)) {
        console.error("Input logo not found at: " + inputLogoPath);
        return;
    }

    try {
        const resizedLogo = await sharp(inputLogoPath)
            .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .toBuffer();

        // Create text overlay using SVG
        const textSvg = `
            <svg width="${width}" height="200" xmlns="http://www.w3.org/2000/svg">
                <style>
                    .title { font-family: 'Arial', sans-serif; font-size: 64px; font-weight: bold; fill: #0EA5E9; text-anchor: middle; }
                    .subtitle { font-family: 'Arial', sans-serif; font-size: 36px; font-weight: bold; fill: #64748B; text-anchor: middle; letter-spacing: 4px; }
                </style>
                <text x="512" y="80" class="title">PERTAMAK</text>
                <text x="512" y="140" class="subtitle">MOBILE HUB</text>
            </svg>
        `;

        // Create main icon (with padding and white background)
        await sharp({
            create: {
                width: width,
                height: height,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for app icon
            }
        })
        .composite([
            { input: resizedLogo, top: 150, left: (width - logoSize) / 2 },
            { input: Buffer.from(textSvg), top: 800, left: 0 }
        ])
        .png()
        .toFile(outputIconPath);

        // Create adaptive icon (transparent background, as Expo uses adaptiveIcon.backgroundColor)
        await sharp({
            create: {
                width: width,
                height: height,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
            }
        })
        .composite([
            { input: resizedLogo, top: 150, left: (width - logoSize) / 2 },
            { input: Buffer.from(textSvg), top: 800, left: 0 }
        ])
        .png()
        .toFile(outputAdaptiveIconPath);
        
        // Also create a splash icon
        await sharp({
            create: {
                width: width,
                height: height,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            }
        })
        .composite([
            { input: resizedLogo, top: 200, left: (width - logoSize) / 2 },
            { input: Buffer.from(textSvg), top: 850, left: 0 }
        ])
        .png()
        .toFile(outputSplashPath);

        // Also create a favicon (using just the logo, no text, small size)
        await sharp(inputLogoPath)
            .resize(48, 48, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .png()
            .toFile(outputFaviconPath);

        console.log("Icons successfully generated with text 'PERTAMAK MOBILE HUB' added!");
    } catch (e) {
        console.error("Error generating icons:", e);
    }
}

generateAppIcon();
