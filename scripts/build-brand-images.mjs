// Generates the small brand images used by browsers, search engines and link
// previews, from the artwork already in public/:
//
//   public/favicon-alvea.png  →  public/icons/icon-48.png, icon-192.png,
//                                icon-512.png, apple-touch-icon.png,
//                                public/favicon.ico
//   public/logo-navbar.png    →  public/og-image.png (1200×630)
//
// The originals are not modified. Run again only if the artwork changes:
//   node scripts/build-brand-images.mjs

import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const FAVICON = 'public/favicon-alvea.png'
const LOGO    = 'public/logo-navbar.png'

await mkdir('public/icons', { recursive: true })

for (const [size, name] of [[48, 'icon-48'], [192, 'icon-192'], [512, 'icon-512'], [180, 'apple-touch-icon']]) {
  await sharp(FAVICON).resize(size, size).png({ compressionLevel: 9, palette: size <= 192 }).toFile(`public/icons/${name}.png`)
}

/* favicon.ico: a one-image ICO container around a 48×48 PNG */
const png = await sharp(FAVICON).resize(48, 48).png({ compressionLevel: 9 }).toBuffer()
const header = Buffer.alloc(22)
header.writeUInt16LE(0, 0)           // reserved
header.writeUInt16LE(1, 2)           // type: icon
header.writeUInt16LE(1, 4)           // one image
header.writeUInt8(48, 6)             // width
header.writeUInt8(48, 7)             // height
header.writeUInt16LE(1, 10)          // colour planes
header.writeUInt16LE(32, 12)         // bits per pixel
header.writeUInt32LE(png.length, 14) // image size
header.writeUInt32LE(22, 18)         // image offset
await writeFile('public/favicon.ico', Buffer.concat([header, png]))

/* Link preview: the logo centred on the site's night-sky gradient */
const background = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
     <defs>
       <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="#020810"/>
         <stop offset="0.55" stop-color="#0A2340"/>
         <stop offset="1" stop-color="#173965"/>
       </linearGradient>
       <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
         <stop offset="0" stop-color="#D4A853" stop-opacity="0.16"/>
         <stop offset="1" stop-color="#D4A853" stop-opacity="0"/>
       </radialGradient>
     </defs>
     <rect width="1200" height="630" fill="url(#sky)"/>
     <ellipse cx="600" cy="315" rx="520" ry="300" fill="url(#glow)"/>
   </svg>`,
)
const logo = await sharp(LOGO).resize(590, 590).toBuffer()
await sharp(background)
  .composite([{ input: logo, left: 305, top: 20 }])
  .png({ compressionLevel: 9 })
  .toFile('public/og-image.png')

console.log('brand images written')
