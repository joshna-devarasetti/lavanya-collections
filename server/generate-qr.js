const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const targetUrl = 'http://10.230.144.205:5173/';
const localUrl = 'http://localhost:5173/';

const clientPublicDir = path.join(__dirname, '..', 'client', 'public');
const artifactDir = path.join('C:', 'Users', 'Joshna', '.gemini', 'antigravity', 'brain', '81609caf-fcc6-4a84-8c91-972ad890f0d4');

async function run() {
  console.log(`Generating QR code for: ${targetUrl}`);

  // Options for high quality & contrast
  const options = {
    errorCorrectionLevel: 'H',
    type: 'png',
    quality: 0.95,
    margin: 2,
    color: {
      dark: '#2C1810',  // Dark brown boutique color
      light: '#FAF7F2' // Warm ivory background
    },
    width: 400
  };

  // 1. Save to client/public/qr-code.png
  const publicPngPath = path.join(clientPublicDir, 'qr-code.png');
  await QRCode.toFile(publicPngPath, targetUrl, options);
  console.log(`Saved PNG to: ${publicPngPath}`);

  // 2. Save SVG version
  const publicSvgPath = path.join(clientPublicDir, 'qr-code.svg');
  await QRCode.toFile(publicSvgPath, targetUrl, {
    ...options,
    type: 'svg'
  });
  console.log(`Saved SVG to: ${publicSvgPath}`);

  // 3. Save to artifact directory
  if (fs.existsSync(artifactDir)) {
    const artifactPngPath = path.join(artifactDir, 'qr-code.png');
    await QRCode.toFile(artifactPngPath, targetUrl, options);
    console.log(`Saved artifact PNG to: ${artifactPngPath}`);
  }

  // 4. Also generate Base64 Data URL
  const dataUrl = await QRCode.toDataURL(targetUrl, options);
  fs.writeFileSync(path.join(clientPublicDir, 'qr-code-base64.txt'), dataUrl);
  console.log('Saved Base64 Data URL');

  // 5. Generate UTF-8 ASCII art for terminal preview
  const ascii = await QRCode.toString(targetUrl, { type: 'terminal', small: true });
  console.log('\n--- SCAN WITH YOUR PHONE CAMERA ---');
  console.log(ascii);
  console.log('------------------------------------');
}

run().catch(console.error);
