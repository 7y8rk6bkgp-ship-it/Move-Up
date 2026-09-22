import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outDir = path.join(root, 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const icon = path.join(root, 'src-icons', 'icon.svg')
const maskable = path.join(root, 'src-icons', 'maskable.svg')

const targets = [
  { src: icon, size: 64, name: 'icon-64.png' },
  { src: icon, size: 192, name: 'icon-192.png' },
  { src: icon, size: 512, name: 'icon-512.png' },
  { src: icon, size: 180, name: 'apple-touch-icon.png' },
  { src: icon, size: 32, name: 'favicon-32.png' },
  { src: maskable, size: 192, name: 'maskable-192.png' },
  { src: maskable, size: 512, name: 'maskable-512.png' },
]

for (const t of targets) {
  await sharp(t.src).resize(t.size, t.size).png().toFile(path.join(outDir, t.name))
  console.log('wrote', t.name)
}
